import React from 'react';
import IconMui from '@material-ui/core/Icon';
import _ from '../mson/lodash';

// Note: we use font icons instead of SVG icons as this allows us to support any icon dynamically
// without adding all icons to the JS bundle. The MaterialUI icons are about 54KB which is
// substantially smaller than their SVG counterparts.
//
// import * as Icons from '@material-ui/icons';

export default class Icon extends React.PureComponent {
  handleClick = event => {
    if (this.props.onClick) {
      this.props.onClick(event);
    }
  };

  // Convert to the font icon name so that we can use the SVG Icon names. This allows us to make
  // changes to this logic without changing the calling code.
  toFontIconName(svgIconName) {
    return _.snakeCase(svgIconName);
  }

  render() {
    const { className, icon } = this.props;

    const iconContents = icon ? this.toFontIconName(icon) : null;

    return (
      <IconMui className={className} onClick={this.handleClick}>
        {iconContents}
      </IconMui>
    );
  }
}
