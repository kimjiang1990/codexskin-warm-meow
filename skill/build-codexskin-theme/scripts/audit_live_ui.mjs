#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

function parseArgs(values) {
  const options = {
    toolkit: process.env.CODEXSKIN_TOOLKIT_DIR || join(homedir(), '.cache', 'codexskin-skills'),
    port: Number(process.env.CODEXSKIN_CDP_PORT || '9341'),
    theme: '',
    all: false,
    screenshotDir: '',
    json: '',
  };

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === '--all') options.all = true;
    else if (value === '--toolkit') options.toolkit = values[++index] || '';
    else if (value === '--port') options.port = Number(values[++index]);
    else if (value === '--theme') options.theme = values[++index] || '';
    else if (value === '--screenshot-dir') options.screenshotDir = values[++index] || '';
    else if (value === '--json') options.json = values[++index] || '';
    else if (value === '--help' || value === '-h') {
      console.log(`Usage:
  node audit_live_ui.mjs --toolkit <dir> [--theme <id>] [--port 9341] [--all]
                         [--screenshot-dir <dir>] [--json <file>]`);
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${value}`);
    }
  }

  if (!options.toolkit) throw new Error('--toolkit requires a directory.');
  if (!Number.isInteger(options.port) || options.port < 1 || options.port > 65535) {
    throw new Error('--port must be a valid TCP port.');
  }
  return options;
}

const options = parseArgs(process.argv.slice(2));
process.argv.splice(2);
process.env.CODEXSKIN_CDP_PORT = String(options.port);

const toolkitDir = resolve(options.toolkit);
const toolkitScript = join(toolkitDir, 'scripts', 'codexskin.mjs');
const codexskin = await import(pathToFileURL(toolkitScript).href);
const located = await codexskin.locateCdpTargets(options.port);
const target = located.targets?.[0];

if (!target) {
  throw new Error(`No themeable Codex workspace renderer found on 127.0.0.1:${options.port}.`);
}

async function evaluate(expression) {
  return codexskin.evaluateTarget(target, expression);
}

async function evalJson(expression) {
  return JSON.parse(await evaluate(`JSON.stringify(${expression})`));
}

async function wait(milliseconds) {
  await new Promise((resolveWait) => setTimeout(resolveWait, milliseconds));
}

async function mouse(point, type, extra = {}) {
  return codexskin.sendCdp(target, 'Input.dispatchMouseEvent', {
    type,
    x: point.x,
    y: point.y,
    ...extra,
  });
}

async function clickAt(point) {
  await mouse(point, 'mousePressed', { button: 'left', clickCount: 1 });
  await mouse(point, 'mouseReleased', { button: 'left', clickCount: 1 });
}

async function pressKey(key, code, virtualKeyCode, modifiers = 0) {
  await codexskin.sendCdp(target, 'Input.dispatchKeyEvent', {
    type: 'rawKeyDown',
    key,
    code,
    windowsVirtualKeyCode: virtualKeyCode,
    modifiers,
  });
  await codexskin.sendCdp(target, 'Input.dispatchKeyEvent', {
    type: 'keyUp',
    key,
    code,
    windowsVirtualKeyCode: virtualKeyCode,
    modifiers,
  });
}

async function capture(name) {
  if (!options.screenshotDir) return '';
  const outputDir = isAbsolute(options.screenshotDir)
    ? options.screenshotDir
    : resolve(options.screenshotDir);
  await mkdir(outputDir, { recursive: true });
  const screenshot = await codexskin.sendCdp(target, 'Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
  });
  const output = join(outputDir, `${name}.png`);
  await writeFile(output, Buffer.from(screenshot.data, 'base64'));
  return output;
}

async function returnToAppIfSettings() {
  const returned = await evalJson(`(() => {
    const control = document.querySelector('.sidebar-item[role="link"]');
    if (!control || !/返回应用|Back to app/i.test(control.textContent.trim())) return false;
    control.click();
    return true;
  })()`);
  if (returned) await wait(220);
  return returned;
}

await returnToAppIfSettings();

const status = await codexskin.statusTheme(false, located);
const originalLog = console.log;
let officialAudit;
try {
  console.log = () => {};
  officialAudit = await codexskin.auditTheme();
} finally {
  console.log = originalLog;
}

const inventory = await evalJson(`(() => {
  const visible = (element) => {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return rect.width > 0 && rect.height > 0
      && style.display !== 'none' && style.visibility !== 'hidden';
  };
  const count = (selector) => [...document.querySelectorAll(selector)].filter(visible).length;
  return {
    sidebar: count('.app-shell-left-panel'),
    composer: count('.composer-surface-chrome, [data-codex-composer="true"]'),
    menu: count('[role="menu"]'),
    dialog: count('[role="dialog"]'),
    tooltip: count('[role="tooltip"]'),
    output: count('[data-codexskin-surface="output"], [data-testid*="output"]'),
    diff: count('[data-codexskin-surface="diff"], [data-testid*="diff"]'),
    terminal: count('[data-codexskin-surface="terminal"], .xterm'),
    code: count('pre, code'),
  };
})()`);

const report = {
  status: 'pass',
  expectedTheme: options.theme || null,
  activeTheme: status.themeId || null,
  officialAudit: {
    status: officialAudit.status,
    criticalCount: officialAudit.criticalCount || 0,
    warningCount: officialAudit.warningCount || 0,
    pages: officialAudit.pages || 0,
  },
  skippedTargets: located.skipped || [],
  inventory,
  checks: {},
  issues: [],
  warnings: [],
  screenshots: [],
};

if (options.theme && status.themeId !== options.theme) {
  report.issues.push(`Expected active theme "${options.theme}", found "${status.themeId || 'none'}".`);
}
if ((officialAudit.criticalCount || 0) >= 2 || officialAudit.status === 'fail') {
  report.issues.push(`Official readability audit failed with ${officialAudit.criticalCount || 0} critical samples.`);
} else if ((officialAudit.criticalCount || 0) === 1) {
  report.warnings.push('Official audit found one isolated critical sample; inspect it manually.');
}

if (options.all) {
  const sidebarSeed = await evalJson(`(() => {
    const visible = (element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight;
    };
    const items = [...document.querySelectorAll('.app-shell-left-panel .sidebar-item')].filter(visible);
    const selected = items.find((element) =>
      element.matches('[aria-current="page"]')
      || element.classList.contains('bg-token-list-hover-background')
    );
    const hover = items.find((element) => element !== selected);
    const rect = hover?.getBoundingClientRect();
    const selectedStyle = selected ? getComputedStyle(selected) : null;
    return {
      hoverPoint: rect ? { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 } : null,
      selected: selected ? {
        text: selected.textContent.trim().slice(0, 100),
        background: selectedStyle.backgroundColor,
        color: selectedStyle.color,
      } : null,
    };
  })()`);

  let hovered = null;
  if (sidebarSeed.hoverPoint) {
    await mouse(sidebarSeed.hoverPoint, 'mouseMoved');
    await wait(140);
    hovered = await evalJson(`(() => {
      const element = document.elementFromPoint(
        ${sidebarSeed.hoverPoint.x},
        ${sidebarSeed.hoverPoint.y}
      )?.closest('.sidebar-item');
      if (!element) return null;
      const style = getComputedStyle(element);
      return {
        text: element.textContent.trim().slice(0, 100),
        background: style.backgroundColor,
        color: style.color,
        transition: style.transition,
      };
    })()`);
  }
  report.checks.sidebarStates = {
    status: sidebarSeed.selected && hovered ? 'verified' : 'not mounted',
    selected: sidebarSeed.selected,
    hovered,
  };

  const profileButton = await evalJson(`(() => {
    const candidates = [...document.querySelectorAll('button[aria-haspopup="menu"]')];
    const element = candidates.find((candidate) =>
      /profile|personal|个人资料/i.test(candidate.getAttribute('aria-label') || '')
    ) || candidates.find((candidate) => {
      const rect = candidate.getBoundingClientRect();
      return rect.x < 280 && rect.bottom > innerHeight - 120;
    });
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return {
      expanded: element.getAttribute('aria-expanded') === 'true',
      point: { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 },
    };
  })()`);

  if (profileButton && !profileButton.expanded) {
    await clickAt(profileButton.point);
    await wait(180);
  }
  const profileMenu = await evalJson(`(() => {
    const element = [...document.querySelectorAll('[role="menu"]')]
      .find((candidate) => {
        const rect = candidate.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
    if (!element) return null;
    const style = getComputedStyle(element);
    return {
      text: element.innerText.trim().slice(0, 300),
      background: style.backgroundColor,
      color: style.color,
      rect: element.getBoundingClientRect().toJSON(),
    };
  })()`);
  report.checks.profileMenu = {
    status: profileMenu ? 'verified' : 'not mounted',
    sample: profileMenu,
  };
  if (profileMenu) await pressKey('Escape', 'Escape', 27);
  await wait(100);

  const projectCandidates = await evalJson(`(() => {
    const visible = (element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight;
    };
    const items = [...document.querySelectorAll(
      '.app-shell-left-panel [data-app-action-sidebar-project-row]'
    )]
      .filter(visible)
      .slice(0, 12);
    return items.map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        text: element.textContent.trim().slice(0, 100),
        point: { x: rect.x + Math.min(rect.width * .55, 150), y: rect.y + rect.height / 2 },
      };
    });
  })()`);

  let projectTooltip = null;
  for (const candidate of projectCandidates) {
    await mouse({ x: 400, y: 40 }, 'mouseMoved');
    await wait(80);
    await mouse(candidate.point, 'mouseMoved');
    await wait(950);
    projectTooltip = await evalJson(`(() => {
      const element = [...document.querySelectorAll('[role="tooltip"]')]
        .find((candidate) => {
          const rect = candidate.getBoundingClientRect();
          return rect.width > 160 && rect.height > 60;
        });
      if (!element) return null;
      const style = getComputedStyle(element);
      return {
        trigger: ${JSON.stringify(candidate.text)},
        text: element.innerText.trim().slice(0, 400),
        background: style.backgroundColor,
        color: style.color,
        rect: element.getBoundingClientRect().toJSON(),
      };
    })()`);
    if (projectTooltip) break;
  }
  report.checks.projectTooltip = {
    status: projectTooltip ? 'verified' : 'not mounted',
    sample: projectTooltip,
  };
  if (projectTooltip) report.screenshots.push(await capture('project-tooltip'));
  await mouse({ x: Math.max(400, 0), y: 40 }, 'mouseMoved');
  await wait(100);

  let narrow;
  try {
    await codexskin.sendCdp(target, 'Emulation.setDeviceMetricsOverride', {
      width: 980,
      height: 760,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await wait(180);
    narrow = await evalJson(`(() => ({
      viewport: { width: innerWidth, height: innerHeight },
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))()`);
    report.screenshots.push(await capture('narrow-980x760'));
  } finally {
    await codexskin.sendCdp(target, 'Emulation.clearDeviceMetricsOverride').catch(() => {});
  }
  report.checks.narrow = {
    status: narrow?.horizontalOverflow ? 'failed' : 'verified',
    ...narrow,
  };
  if (narrow?.horizontalOverflow) report.issues.push('The 980px layout has horizontal overflow.');

  const openProfile = await evalJson(`(() => {
    const candidates = [...document.querySelectorAll('button[aria-haspopup="menu"]')];
    const element = candidates.find((candidate) =>
      /profile|personal|个人资料/i.test(candidate.getAttribute('aria-label') || '')
    ) || candidates.find((candidate) => {
      const rect = candidate.getBoundingClientRect();
      return rect.x < 280 && rect.bottom > innerHeight - 120;
    });
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return {
      expanded: element.getAttribute('aria-expanded') === 'true',
      point: { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 },
    };
  })()`);
  if (openProfile && !openProfile.expanded) {
    await clickAt(openProfile.point);
    await wait(160);
  }

  const settingsFound = await evalJson(`(() => {
    const item = [...document.querySelectorAll('[role="menuitem"]')]
      .find((element) => /^(设置|Settings)/i.test(element.innerText.trim()));
    item?.focus();
    return Boolean(item);
  })()`);

  if (settingsFound) {
    await pressKey('Enter', 'Enter', 13);
    await wait(250);
    const categories = await evalJson(`(() => {
      const visible = (element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 0 && rect.height > 0
          && style.display !== 'none' && style.visibility !== 'hidden';
      };
      const values = [...document.querySelectorAll('button.sidebar-item')]
        .filter(visible)
        .filter((element) => element.getBoundingClientRect().x < 280)
        .map((element) => element.innerText.trim())
        .filter(Boolean);
      return [...new Set(values)].slice(0, 40);
    })()`);

    const settingsResults = [];
    for (const category of categories) {
      const clicked = await evalJson(`(() => {
        const element = [...document.querySelectorAll('button.sidebar-item')]
          .find((candidate) => candidate.innerText.trim() === ${JSON.stringify(category)});
        element?.click();
        return Boolean(element);
      })()`);
      if (!clicked) continue;
      await wait(170);
      const sample = await evalJson(`(() => {
        const visible = (element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return rect.width > 0 && rect.height > 0
            && rect.bottom > 0 && rect.top < innerHeight
            && style.display !== 'none' && style.visibility !== 'hidden';
        };
        const parse = (value) => {
          const match = value.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?/);
          return match ? {
            r: Number(match[1]),
            g: Number(match[2]),
            b: Number(match[3]),
            a: match[4] == null ? 1 : Number(match[4]),
          } : null;
        };
        const channel = (value) => {
          const normalized = value / 255;
          return normalized <= .03928
            ? normalized / 12.92
            : ((normalized + .055) / 1.055) ** 2.4;
        };
        const luminance = (color) =>
          .2126 * channel(color.r) + .7152 * channel(color.g) + .0722 * channel(color.b);
        const contrast = (first, second) => {
          const high = Math.max(luminance(first), luminance(second));
          const low = Math.min(luminance(first), luminance(second));
          return (high + .05) / (low + .05);
        };
        const badLarge = [...document.querySelectorAll('body *')]
          .filter(visible)
          .map((element) => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            const background = parse(style.backgroundColor);
            const color = parse(style.color);
            if (
              rect.x < 267 || rect.width < 250 || rect.height < 70
              || !background || background.a < .4 || !color
              || contrast(background, color) >= 3
            ) return null;
            return {
              text: (element.innerText || '').trim().slice(0, 120),
              background: style.backgroundColor,
              color: style.color,
              ratio: Number(contrast(background, color).toFixed(2)),
              cls: typeof element.className === 'string' ? element.className.slice(0, 180) : '',
            };
          })
          .filter(Boolean)
          .slice(0, 8);
        const selected = [...document.querySelectorAll('button.sidebar-item')]
          .find((element) => element.classList.contains('bg-token-list-hover-background'));
        const foreground = selected?.querySelector(
          '[class*="text-token-list-active-selection-foreground"]'
        ) || selected;
        return {
          heading: [...document.querySelectorAll('h1')].find(visible)?.innerText || '',
          badLarge,
          selectedBackground: selected ? getComputedStyle(selected).backgroundColor : null,
          selectedColor: foreground ? getComputedStyle(foreground).color : null,
        };
      })()`);
      settingsResults.push({ category, ...sample });
    }

    report.checks.settings = {
      status: settingsResults.length ? 'verified' : 'not mounted',
      categoriesChecked: settingsResults.length,
      issues: settingsResults.filter((result) => result.badLarge.length),
      samples: settingsResults,
    };
    if (report.checks.settings.issues.length) {
      report.issues.push(
        `Settings has ${report.checks.settings.issues.length} categories with large low-contrast surfaces.`
      );
    }
    report.screenshots.push(await capture('settings'));

    await returnToAppIfSettings().catch(() => false);
  } else {
    report.checks.settings = { status: 'not mounted', categoriesChecked: 0, issues: [] };
    report.warnings.push('Settings could not be opened from the current renderer.');
  }
}

report.screenshots = report.screenshots.filter(Boolean);
if (report.issues.length) report.status = 'fail';
else if (report.warnings.length) report.status = 'pass-with-warnings';

const output = `${JSON.stringify(report, null, 2)}\n`;
if (options.json) {
  const outputPath = isAbsolute(options.json) ? options.json : resolve(options.json);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, output, 'utf8');
}
process.stdout.write(output);
