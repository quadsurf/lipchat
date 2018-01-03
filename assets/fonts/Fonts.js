

import React, { Component } from 'react'
import { Text } from 'react-native'

//LOCALS
import { Colors,Texts } from '../../css/Styles'

class FontLato extends Component {

  getLato(){
    let whichLato;
    switch (this.props.weight) {
      case 'hairline': whichLato = 'LatoHairline'
        break;
      case 'light': whichLato = 'LatoLight'
        break;
      case 'bold': whichLato = 'LatoBold'
        break;
      default: whichLato = 'Lato'
    }
    return whichLato;
  }

  render() {
    return (
      <Text
        {...this.props}
        style={[this.props.style, { fontFamily: this.getLato() }]}
        allowFontScaling={false}
      />
    );
  }
}

class FontMatilde extends Component {
  render() {
    return (
      <Text
        {...this.props}
        style={[this.props.style, {
          fontFamily: 'Matilde',
          fontSize:this.props.size || Texts.xlarge.fontSize,
          color:this.props.color || Colors.blue,
          textDecorationLine:this.props.underline ? 'underline' : 'none',
          backgroundColor:'transparent'
        }]}
        allowFontScaling={false}
        selectable={true}
        numberOfLines={1}>
        {this.props.text}
      </Text>
    )
  }
}

class FontPoiret extends Component {
  render() {
    return (
      <Text
        {...this.props}
        style={[this.props.style, {
          fontFamily: 'Poiret',
          fontSize:this.props.size || Texts.xlarge.fontSize,
          color:this.props.color || Colors.blue,
          textDecorationLine:this.props.underline ? 'underline' : 'none',
          paddingVertical: this.props.vspace || 0,
          backgroundColor:'transparent'
        }]}
        allowFontScaling={false}
        selectable={true}
        numberOfLines={1}>
        {this.props.text}
      </Text>
    )
  }
}

export {
  FontMatilde,FontPoiret
}

// class FontBalqis extends Component {
//   render() {
//     return (
//       <Text
//         {...this.props}
//         style={[this.props.style, { fontFamily: 'Balqis' }]}
//         allowFontScaling={false}
//       />
//     );
//   }
// }
//
// class FontClicker extends Component {
//   render() {
//     return (
//       <Text
//         {...this.props}
//         style={[this.props.style, { fontFamily: 'Clicker' }]}
//         allowFontScaling={false}
//       />
//     );
//   }
// }
//
// class FontConeria extends Component {
//   render() {
//     return (
//       <Text
//         {...this.props}
//         style={[this.props.style, { fontFamily: 'Coneria' }]}
//         allowFontScaling={false}
//       />
//     );
//   }
// }

// class FontSavoye extends Component {
//   render() {
//     return (
//       <Text
//         {...this.props}
//         style={[this.props.style, { fontFamily: 'Savoye' }]}
//         allowFontScaling={false}
//       />
//     );
//   }
// }
//
// class FontShintia extends Component {
//   render() {
//     return (
//       <Text
//         {...this.props}
//         style={[this.props.style, { fontFamily: 'Shintia' }]}
//         allowFontScaling={false}
//       />
//     );
//   }
// }



// FontBalqis,FontClicker,FontConeria,FontSavoye,FontShintia
