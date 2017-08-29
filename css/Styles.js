

const purpleLightest = '#7E82B1'
const purpleLighter = '#696DA5'
const purpleLight = '#545997'
const purpleText = '#6E639E'//6E67A8
const purpleLive = '#352976'
const purple = '#371A85'
const purpleDarker = '#2C1872'
const purplest = '#673ab7'
const blue = '#6EFAFD'
const bluergba = 'rgba(110,250,253,1)'
const blueLive = '#6CF7FB'
const transparent = 'rgba(0,0,0,0)'
const pinkly = '#ff4081'
const pinkest = '#E3007E'
const red = '#EC174F'
const pink = '#ED5AF7'
const pinkLive = '#EA74FE'
const white = '#fff'
const offWhite = '#fefefe'
const transparentWhite = 'rgba(255,255,255,.3)'
const transparentPurplest = 'rgba(103,58,183,.7)'
const gray = '#888'
const black = '#000'
const green = '#4caf50'

const Colors = {
  purple,purpleDarker,purpleText,purpleLight,purpleLighter,purpleLightest,purpleLive,purplest,transparentPurplest,
  blue,bluergba,blueLive,black,green,pinkest,pinkly,pink,pinkLive,white,offWhite,transparentWhite,gray,red,
  bgColor: purple
}

const Views = {
  topCenter: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  middle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bottomCenter: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  middleNoFlex: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  bottomCenterNoFlex: {
    justifyContent: 'flex-end',
    alignItems: 'center'
  }
}

const Texts = {
  small: {
    fontSize: 14
  },
  medium: {
    fontSize: 18
  },
  large: {
    fontSize: 25
  },
  larger: {
    fontSize: 40
  },
  xlarge: {
    fontSize: 74
  }
}

export {Colors,Views,Texts}
