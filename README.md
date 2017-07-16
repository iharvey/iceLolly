# Icelolly JavaScript Tech Test

## Task

Recreate the functionality of the *Airport* selector in the search bar of the icelolly.com site. You should aim to spend no more than two hours on this test.


## Constraints

- No external JavaScript libraries should be used.
- You should use the provided `index.html` file as a starting point.


## Acceptance criteria

- The *Airport* dialog should be populated using the contents of the hidden select box with ID `airport`.
    - Note that some deduplication will be required, as some airports appear in more than one airport group.
    - Note also that although example HTML has been provided to arrange checkboxes in a grid, this may be replaced with alternative HTML if required.

- Clicking on any airport or airport group tickbox should update other airport and airport group tickboxes as per the implementation on the live icelolly.com site.
    - There are a number of subtle behaviours in relation to ticking/unticking that should ideally be captured as part of your implementation.

- The 'Deselect all' link should untick all selected airports and tick the 'Any airport' option.

- The 'x airports selected' caption alongside the 'Deselect all' (with ID `airport-count`) link should be updated appropriately as airports are selected and deselected.

For further clarification regarding any of these acceptance criteria, please see the existing implementation on the icelolly website.


## Out of scope

The following are behaviours that occur on the live icelolly.com site but don't need to be implemented as part of this test:

- Opening and closing of the *Airport* dialog.
- Updating of the text box contents (with ID `airport-caption`) below the 'Airport' label.


