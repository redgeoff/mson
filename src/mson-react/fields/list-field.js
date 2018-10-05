import React from 'react';
import ListItemField from './list-item-field';
import attach from '../attach';
import Button from '../button';
import CommonField from './common-field';

class ListField extends React.PureComponent {
  handleNew = () => {
    this.props.component.createField();

    // Reset the touched state so that errors aren't reported immediately when the user hasn't
    // finished entering the new value.
    this.props.component.set({ touched: false });
  };

  render() {
    const {
      component,
      allowDelete,
      useDisplayValue,
      autoCreateFields,
      hideLabel,
      editable,
      canDeleteEmpty,
      accessEditable,
      disabled,
      hideDeleteButton
    } = this.props;

    const singularLabel = component.getSingularLabel();

    const dis = accessEditable === false || disabled;

    let fields = [];
    let first = true;

    const isBlank = component.isBlank();

    component.eachField((field, index) => {
      const fieldIsBlank = field.isBlank();

      // When using the display value, we hide any blank fields, e.g. the empty "next" fields
      if (first || !useDisplayValue || !fieldIsBlank) {
        // We have to pass allowDelete as it is the allowDelete of the parent
        fields.push(
          <ListItemField
            component={field}
            key={index}
            allowDelete={
              allowDelete &&
              !useDisplayValue &&
              (canDeleteEmpty || !fieldIsBlank) &&
              !hideDeleteButton
            }
          />
        );
      }

      if (first) {
        first = false;
      }
    });

    if (!autoCreateFields && !useDisplayValue && editable && !dis) {
      fields.push(
        <Button
          key="button"
          aria-label="add"
          onClick={this.handleNew}
          icon="Add"
          label={'Add ' + singularLabel}
          marginTop={false}
        />
      );
    }

    return (
      <span>
        {!hideLabel && (
          <CommonField
            component={component}
            inlineLabel="true"
            marginBottom={false}
            shrinkLabel={!isBlank}
          />
        )}
        <div>{fields}</div>
      </span>
    );
  }
}

// We want the component to update when we receive new fields
export default attach([
  'change',
  'help',
  'allowDelete',
  'useDisplayValue',
  'autoCreateFields',
  'hideLabel',
  'value',
  'editable',
  'canDeleteEmpty',
  'disabled',
  'hideDeleteButton'
])(ListField);
