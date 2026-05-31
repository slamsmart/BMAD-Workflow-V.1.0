#!/usr/bin/env node
/**
 * CI Gate — Validates audit results from:
 *   - Lighthouse (performance, a11y, best practices, SEO)
 *   - OWASP ZAP DAST (security alerts)
 *   - axe-core (accessibility violations)
 *
 * Hard rules (BMAD workflow):
 *   - Lighthouse score < 90 (any category) → FAIL
 *   - DAST High alert > 0                  → FAIL
 *   - WCAG critical/serious violation > 0  → FAIL
 *   - Otherwise                            → PASS
 *
 * Exit codes:
 *   0 — all checks passed
 *   1 — one or more checks failed
 *   2 — report file missing / invalid
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// Config
// ============================================================
const CONFIG = {
  lighthouseReport: process.env.LIGHTHOUSE_REPORT || './lighthouse-report.json',
  zapReport:        process.env.ZAP_REPORT        || './zap-report.json',
  axeReport:        process.env.AXE_REPORT        || './axe-results.json',
  thresholds: {
    performance:   parseInt(process.env.LH_PERF_MIN  || '90', 10),
    accessibility: parseInt(process.env.LH_A11Y_MIN  || '90', 10),
    bestPractices: parseInt(process.env.LH_BP_MIN    || '90', 10),
    seo:           parseInt(process.env.LH_SEO_MIN   || '90', 10),
  },
  blockOnDastMedium: process.env.BLOCK_ON_DAST_MEDIUM === 'true',
  outputJson:        process.env.CI_GATE_OUTPUT || './ci-gate-result.json',
};

// ============================================================
// Helpers
// ============================================================
function loadJson(filePath, label) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  ${label} report tidak ditemukan: ${filePath}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`❌ ${label} report invalid: ${e.message}`);
    process.exit(2);
  }
}

function color(text, c) {
  const codes = { red: 31, green: 32, yellow: 33, blue: 34, gray: 90 };
  return process.stdout.isTTY ? `\x1b[${codes[c]}m${text}\x1b[0m` : text;
}

function divider(label) {
  console.log('\n' + color('─'.repeat(60), 'gray'));
  if (label) console.log(color(label, 'blue'));
  console.log(color('─'.repeat(60), 'gray'));
}

// ============================================================
// Lighthouse Check
// ============================================================
function checkLighthouse(report) {
  if (!report) return { skipped: true };

  const cats = report.categories || {};
  const scores = {
    performance:   Math.round((cats.performance?.score   || 0) * 100),
    accessibility: Math.round((cats.accessibility?.score || 0) * 100),
    bestPractices: Math.round((cats['best-practices']?.score || 0) * 100),
    seo:           Math.round((cats.seo?.score || 0) * 100),
  };

  const failed = [];
  for (const [key, score] of Object.entries(scores)) {
    const min = CONFIG.thresholds[key];
    if (score < min) failed.push({ category: key, score, min });
  }

  divider('⚡ Lighthouse');
  for (const [key, score] of Object.entries(scores)) {
    const min = CONFIG.thresholds[key];
    const status = score >= min ? color('✅', 'green') : color('❌', 'red');
    console.log(`  ${status} ${key.padEnd(15)} ${score} / min ${min}`);
  }

  return { skipped: false, scores, failed, passed: failed.length === 0 };
}

// ============================================================
// DAST (OWASP ZAP) Check
// ============================================================
function checkDast(report) {
  if (!report) return { skipped: true };

  const alerts = report.site?.[0]?.alerts || [];
  const high   = alerts.filter(a => a.riskdesc?.startsWith('High')).length;
  const medium = alerts.filter(a => a.riskdesc?.startsWith('Medium')).length;
  const low    = alerts.filter(a => a.riskdesc?.startsWith('Low')).length;
  const info   = alerts.filter(a => a.riskdesc?.startsWith('Informational')).length;

  let passed = high === 0;
  if (CONFIG.blockOnDastMedium) passed = passed && medium === 0;

  divider('🔐 DAST (OWASP ZAP)');
  console.log(`  ${high === 0 ? color('✅', 'green') : color('❌', 'red')} High:           ${high}`);
  console.log(`  ${medium === 0 || !CONFIG.blockOnDastMedium ? color('✅', 'green') : color('❌', 'red')} Medium:         ${medium}`);
  console.log(`  ${color('ℹ️', 'gray')}  Low:            ${low}`);
  console.log(`  ${color('ℹ️', 'gray')}  Informational:  ${info}`);

  if (high > 0) {
    console.log(color('\n  Top High alerts:', 'red'));
    alerts.filter(a => a.riskdesc?.startsWith('High')).slice(0, 5).forEach(a => {
      console.log(`    - ${a.name} (${a.instances?.length || 0} instances)`);
    });
  }

  return { skipped: false, high, medium, low, info, passed };
}

// ============================================================
// Accessibility (axe-core) Check
// ============================================================
function checkAxe(report) {
  if (!report) return { skipped: true };

  // axe-cli output bisa berupa array hasil per-URL atau single object
  const results = Array.isArray(report) ? report : [report];

  let critical = 0, serious = 0, moderate = 0, minor = 0;
  for (const r of results) {
    for (const v of (r.violations || [])) {
      const impact = v.impact || 'minor';
      const count = v.nodes?.length || 1;
      if (impact === 'critical')      critical += count;
      else if (impact === 'serious')  serious  += count;
      else if (impact === 'moderate') moderate += count;
      else                            minor    += count;
    }
  }

  const passed = critical === 0 && serious === 0;

  divider('♿ Accessibility (axe-core)');
  console.log(`  ${critical === 0 ? color('✅', 'green') : color('❌', 'red')} Critical:  ${critical}`);
  console.log(`  ${serious  === 0 ? color('✅', 'green') : color('❌', 'red')} Serious:   ${serious}`);
  console.log(`  ${color('ℹ️', 'gray')}  Moderate: ${moderate}`);
  console.log(`  ${color('ℹ️', 'gray')}  Minor:    ${minor}`);

  return { skipped: false, critical, serious, moderate, minor, passed };
}

// ============================================================
// Main
// ============================================================
function main() {
  console.log(color('\n🔍 BMAD Audit Pipeline — CI Gate', 'blue'));
  console.log(color(`   Run at: ${new Date().toISOString()}`, 'gray'));

  const lhReport  = loadJson(CONFIG.lighthouseReport, 'Lighthouse');
  const zapReport = loadJson(CONFIG.zapReport,        'DAST (OWASP ZAP)');
  const axeReport = loadJson(CONFIG.axeReport,        'Accessibility (axe)');

  const results = {
    lighthouse: checkLighthouse(lhReport),
    dast:       checkDast(zapReport),
    axe:        checkAxe(axeReport),
  };

  // ---- Aggregate
  const checked = Object.values(results).filter(r => !r.skipped);
  const failed  = checked.filter(r => !r.passed);
  const allPassed = failed.length === 0 && checked.length > 0;

  // ---- Final report
  const finalReport = {
    timestamp: new Date().toISOString(),
    status: allPassed ? 'PASS' : 'FAIL',
    summary: {
      lighthouse: results.lighthouse.skipped
        ? 'skipped'
        : (results.lighthouse.passed ? 'pass' : 'fail'),
      dast: results.dast.skipped
        ? 'skipped'
        : (results.dast.passed ? 'pass' : 'fail'),
      accessibility: results.axe.skipped
        ? 'skipped'
        : (results.axe.passed ? 'pass' : 'fail'),
    },
    details: results,
  };

  fs.writeFileSync(CONFIG.outputJson, JSON.stringify(finalReport, null, 2));

  divider('📊 Final Verdict');
  if (checked.length === 0) {
    console.log(color('\n⚠️  Tidak ada report yang bisa di-validasi. Gagal sebagai safety net.', 'yellow'));
    console.log(color(`   Result: FAIL (no audit data)`, 'red'));
    process.exit(2);
  }

  if (allPassed) {
    console.log(color('\n✅ ALL CHECKS PASSED', 'green'));
    console.log(color(`   Result saved to: ${CONFIG.outputJson}`, 'gray'));
    process.exit(0);
  } else {
    console.log(color('\n❌ AUDIT FAILED', 'red'));
    console.log(color(`   Failed: ${failed.length} / ${checked.length} checks`, 'red'));
    console.log(color(`   Result saved to: ${CONFIG.outputJson}`, 'gray'));
    process.exit(1);
  }
}

main();
