document.addEventListener('DOMContentLoaded', loadedInit, false);

function loadedInit() {
  const airportContainer = document.getElementById('airport-selector'); // [1]
  const airportDisplayHook = airportContainer.querySelector('.airport-selector-container .airport-selector');
  const airportDataSelect = airportContainer.querySelector('#airport'); // [0]
  const airportOptions = buildArrayFromOptions(airportDataSelect.options);
  let singleChecked = [];

  // remove existing markup in prep
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


  addEventListener('select.airport', function(e) {
    updateChecked(e.detail.src);
    if (multiMarkup.indexOf(e.detail.src) !== -1) handleMultiSelection(e);
    else if (singleMarkup.indexOf(e.detail.src) !== -1) handleSingleSelection(e);
    else handleAnySelection();
  });

  airportContainer.querySelector('.airport-selector-deselect-all').addEventListener('click', handleDeselect);


  function updateChecked(el) {
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
    const selectedInput = e.detail.src.querySelector('input');
    const selectedCodes = selectedInput.dataset.airportCode.split(',');

    if (selectedInput.checked) {
      singleChecked = [...singleChecked, ...selectedCodes];
      singleMarkup.forEach((el) => {
        selectedCodes.forEach((code) => {
          const ref = el.querySelector(`[data-airport-code=${code}]`);
          !!ref && (ref.checked = true);
          !!ref && updateChecked(el);
        });
      });
    } else {
      singleMarkup.forEach((el) => {
        selectedCodes.forEach((code) => {
          singleChecked = singleChecked.filter((c) => c !== code);
          const ref = el.querySelector(`[data-airport-code=${code}]`);
          !!ref && (ref.checked = false);
          !!ref && updateChecked(el);
        });
      });
    }
  }

  function handleSingleSelection(e) {
    // receives src single element, triggers appropriate multi element from data attr
    var single = e.detail.src;
    const singleCode = single.querySelector('input').dataset.airportCode;

     single.querySelector('input').checked
      ? singleChecked = [...singleChecked, singleCode]
      : singleChecked = singleChecked.filter((c) => c !== singleCode);

    multiMarkup.forEach((multi) => {
      const thisMultiCode = multi.querySelector('input').dataset.airportCode.split(',');
      if (thisMultiCode.every((el) => singleChecked.indexOf(el) !== -1 )) {
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
      updateChecked(el);
    }

    multiMarkup.forEach((el) => clearInputs(el));
    singleMarkup.forEach((el) => clearInputs(el));
  }

}


function buildArrayFromOptions(opt) {
  const optArray = [...opt];
  return optArray.reduce(
    (acc, curr) => {
      if (curr.value === '') return acc;
      if (curr.value.indexOf(',') !== -1) {
        // multi select
        acc.multi = [...acc.multi, { label: curr.label, value: curr.value, slug: createSlugFromLabel(curr.label) }];
      } else {
        // single select
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
  divContain.innerHTML = `<input type='checkbox'
                    class='js-airportid airport-selector__check'
                    id='${a.slug}'
                    data-airport-code='${a.value}'
                    value='on'
                    >
                  <label class='airport-selector__label' for='${a.slug}'>${a.label}</label>`;

  const event = new CustomEvent('select.airport', { detail: { data: a.slug, src: divContain } });
  divContain.querySelector('.js-airportid').addEventListener('click', () => dispatchEvent(event));

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
