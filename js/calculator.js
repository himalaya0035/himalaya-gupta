/**
 * calculator.js
 * macOS-style calculator app
 * - Basic arithmetic: +, -, ×, ÷
 * - Percentage, sign toggle, clear
 * - Keyboard support
 * - Display with comma formatting
 */
(() => {
  const display = document.getElementById('calc-display');
  const subDisplay = document.getElementById('calc-sub-display');
  if (!display) return;

  let current = '0';
  let previous = '';
  let operator = null;
  let shouldReset = false;

  function formatNumber(str) {
    if (str.includes('Error')) return str;
    const parts = str.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  function updateDisplay() {
    display.textContent = formatNumber(current);
    if (operator && previous) {
      const opSymbol = { '+': '+', '-': '−', '*': '×', '/': '÷' }[operator] || operator;
      subDisplay.textContent = `${formatNumber(previous)} ${opSymbol}`;
    } else {
      subDisplay.textContent = '';
    }
  }

  function inputDigit(d) {
    if (shouldReset) {
      current = d;
      shouldReset = false;
    } else {
      current = current === '0' ? d : current + d;
    }
    // Limit display length
    if (current.replace(/[.-]/g, '').length > 12) return;
    updateDisplay();
  }

  function inputDecimal() {
    if (shouldReset) {
      current = '0.';
      shouldReset = false;
      updateDisplay();
      return;
    }
    if (!current.includes('.')) {
      current += '.';
      updateDisplay();
    }
  }

  function calculate() {
    const a = parseFloat(previous);
    const b = parseFloat(current);
    if (isNaN(a) || isNaN(b)) return;

    let result;
    switch (operator) {
      case '+': result = a + b; break;
      case '-': result = a - b; break;
      case '*': result = a * b; break;
      case '/': result = b === 0 ? 'Error' : a / b; break;
      default: return;
    }

    if (result === 'Error') {
      current = 'Error';
    } else {
      // Round to avoid floating point issues
      current = String(Math.round(result * 1e10) / 1e10);
    }
    operator = null;
    previous = '';
    shouldReset = true;
    updateDisplay();
  }

  function handleOperator(op) {
    if (operator && !shouldReset) {
      calculate();
    }
    previous = current;
    operator = op;
    shouldReset = true;
    updateDisplay();
  }

  function clear() {
    current = '0';
    previous = '';
    operator = null;
    shouldReset = false;
    updateDisplay();
  }

  function toggleSign() {
    if (current === '0' || current === 'Error') return;
    current = current.startsWith('-') ? current.slice(1) : '-' + current;
    updateDisplay();
  }

  function percentage() {
    if (current === 'Error') return;
    current = String(parseFloat(current) / 100);
    updateDisplay();
  }

  // ── Button clicks ─────────────────────────────────────────────────────
  const grid = document.getElementById('calc-grid');
  if (grid) {
    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('.calc-btn');
      if (!btn) return;

      const val = btn.dataset.value;
      const action = btn.dataset.action;

      if (val !== undefined) {
        if (val === '.') inputDecimal();
        else inputDigit(val);
      } else if (action) {
        switch (action) {
          case 'clear': clear(); break;
          case 'sign': toggleSign(); break;
          case 'percent': percentage(); break;
          case 'add': handleOperator('+'); break;
          case 'subtract': handleOperator('-'); break;
          case 'multiply': handleOperator('*'); break;
          case 'divide': handleOperator('/'); break;
          case 'equals': calculate(); break;
        }
      }
    });
  }

  // ── Keyboard support ──────────────────────────────────────────────────
  window.addEventListener('keydown', (e) => {
    // Only handle if calculator window is visible and active
    const calcWin = document.getElementById('calculator-window');
    if (!calcWin || calcWin.classList.contains('hidden') || !calcWin.classList.contains('active')) return;

    if (e.key >= '0' && e.key <= '9') { inputDigit(e.key); e.preventDefault(); }
    else if (e.key === '.') { inputDecimal(); e.preventDefault(); }
    else if (e.key === '+') { handleOperator('+'); e.preventDefault(); }
    else if (e.key === '-') { handleOperator('-'); e.preventDefault(); }
    else if (e.key === '*') { handleOperator('*'); e.preventDefault(); }
    else if (e.key === '/') { handleOperator('/'); e.preventDefault(); }
    else if (e.key === 'Enter' || e.key === '=') { calculate(); e.preventDefault(); }
    else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') { clear(); e.preventDefault(); }
    else if (e.key === '%') { percentage(); e.preventDefault(); }
    else if (e.key === 'Backspace') {
      if (current.length > 1) current = current.slice(0, -1);
      else current = '0';
      updateDisplay();
      e.preventDefault();
    }
  });

  updateDisplay();
})();
