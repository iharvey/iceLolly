document.addEventListener('DOMContentLoaded', loadedInit, false);

function loadedInit() {
  const airportContainer = document.getElementById('airport-selector'); // [1]
  const airportDisplayHook = airportContainer.querySelector('.airport-selector-container .airport-selector');
  const airportDataSelect = airportContainer.querySelector('#airport'); // [0]

  // [0] build our array of options
  const airportOptions = buildArrayFromOptions(airportDataSelect.options);
  let singlesChecked = [];

  // [1] remove existing markup in prep
  cleanDom(airportDisplayHook, '.grid');

  // attach 'all airports'
  attachToDom(airportDisplayHook, generateMarkup({ label: 'Any Airport', value: '', slug: 'any-airport' }));

  // attach multi selectors
  const multiMarkup = airportOptions.multi.map(airport => generateMarkup(airport));
  attachToDom(airportDisplayHook, multiMarkup);

  // add an <hr>
  airportDisplayHook.insertBefore(document.createElement('hr'), null);

  // attach single selectors
  const singleMarkup = airportOptions.single.map(airport => generateMarkup(airport));
  attachToDom(airportDisplayHook, singleMarkup);


  // event handler for airport selection
  addEventListener('select.airport', function(e) {
    updateOnChecked(e.detail.src);
    if (multiMarkup.indexOf(e.detail.src) !== -1) handleMultiSelection(e);
    else if (singleMarkup.indexOf(e.detail.src) !== -1) handleSingleSelection(e);
    else handleAnySelection();
  });

  // event handler for airport deselect
  airportContainer.querySelector('.airport-selector-deselect-all').addEventListener('click', handleDeselect);


  function updateOnChecked(el) {
    const airportCount = document.getElementById('airport-count');
    const anySelector = document.getElementById('any-airport').parentNode;

    // update surrounding markup for selected options
    el.querySelector('input').checked
      ? el.querySelector('label').classList.add('airport-selector__label--checked')
      : el.querySelector('label').classList.remove('airport-selector__label--checked');

    const activeCount = singleMarkup.reduce((acc, curr) => {
      if (curr.querySelector('input').checked) return (acc += 1);
      return acc;
    }, 0);

    if (activeCount > 0) {
      airportCount.innerHTML = `${activeCount} Airport${activeCount > 1 ? 's' : ''} Selected`;
      anySelector.querySelector('input').checked = false;
      anySelector.querySelector('label').classList.remove('airport-selector__label--checked');
    } else {
      airportCount.innerHTML = '';
      anySelector.querySelector('input').checked = true;
      anySelector.querySelector('label').classList.add('airport-selector__label--checked');
    }
  }


  function handleMultiSelection(e) {
    // receives src multi element, triggers appropriate single elements from data attr
    const multiInput = e.detail.src.querySelector('input');
    const selectedCodes = multiInput.dataset.airportCode.split(',');

    if (multiInput.checked) {
      singlesChecked = [...singlesChecked, ...selectedCodes];
      singleMarkup.forEach((el) => {
        selectedCodes.forEach((code) => {
          const ref = el.querySelector(`[data-airport-code=${code}]`);
          !!ref && (ref.checked = true);
          !!ref && updateOnChecked(el);
        });
      });
    } else {
      singleMarkup.forEach((el) => {
        selectedCodes.forEach((code) => {
          singlesChecked = singlesChecked.filter((c) => c !== code);
          const ref = el.querySelector(`[data-airport-code=${code}]`);
          !!ref && (ref.checked = false);
          !!ref && updateOnChecked(el);
        });
      });
    }
  }


  function handleSingleSelection(e) {
    // receives src single element, triggers appropriate multi element from data attr
    var singleInput = e.detail.src;
    const singleCode = singleInput.querySelector('input').dataset.airportCode;

    singleInput.querySelector('input').checked
      ? singlesChecked = [...singlesChecked, singleCode]
      : singlesChecked = singlesChecked.filter((c) => c !== singleCode);

    multiMarkup.forEach((multi) => {
      const thisMultiCode = multi.querySelector('input').dataset.airportCode.split(',');
      if (thisMultiCode.every((el) => singlesChecked.indexOf(el) !== -1 )) {
        multi.querySelector('input').checked = true;
        multi.querySelector('label').classList.add('airport-selector__label--checked');
      } else {
        multi.querySelector('input').checked = false;
        multi.querySelector('label').classList.remove('airport-selector__label--checked');
      }
    });
  }

  function handleAnySelection() {
    clearSelections();
  }

  function handleDeselect() {
    clearSelections();
  }

  function clearSelections() {
    function clearInputs(el) {
      const ref = el.querySelector('input');
      ref.checked = false;
      updateOnChecked(el);
    }

    multiMarkup.forEach((el) => clearInputs(el));
    singleMarkup.forEach((el) => clearInputs(el));
  }
}


function buildArrayFromOptions(opts) {
  const optArray = [...opts];
  return optArray.reduce(
    (acc, curr) => {
      // any select
      if (curr.value === '') return acc;
      // multi select
      if (curr.value.indexOf(',') !== -1) {
        acc.multi = [...acc.multi, { label: curr.label, value: curr.value, slug: createSlugFromLabel(curr.label) }];
      // single select
      } else {
        acc.single = [...acc.single, { label: curr.label, value: curr.value, slug: createSlugFromLabel(curr.label) }];
      }
      return acc;
    },
    { multi: [], single: [] }
  );
}


const generateMarkup = a => {
  const divContain = document.createElement('div');
  divContain.className = 'grid__item tablet--1-3 search-filters__airitem';
  divContain.innerHTML = `
                  <input type='checkbox'
                    class='js-airportid airport-selector__check'
                    id='${a.slug}'
                    data-airport-code='${a.value}'
                    value='on'
                    >
                  <label class='airport-selector__label' for='${a.slug}'>${a.label}</label>`;

  const airportSelect = new CustomEvent('select.airport', { detail: { data: a.slug, src: divContain } });
  divContain.querySelector('.js-airportid').addEventListener('click', () => dispatchEvent(airportSelect));

  return divContain;
};


const cleanDom = (hook, remove) => {
  hook.querySelectorAll(remove).forEach(el => {
    el.parentNode.removeChild(el);
  });
};

function attachToDom(hook, markup) {
  const grid = document.createElement('div');
  grid.className = 'grid';
  Array.isArray(markup) ? markup.forEach(mk => grid.appendChild(mk)) : grid.appendChild(markup);
  hook.appendChild(grid);
}

function createSlugFromLabel(q) {
  const regex = /[\s\/]/g;
  return q.replace(regex, '-').trim().toString().toLowerCase();
}
