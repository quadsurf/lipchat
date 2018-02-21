

import { Colors } from '../css/Styles'

export default {
  container: {
    flex: 1,
  },
  tabbar: {
    backgroundColor: Colors.purpleText
  },
  tab: {
    padding: 0,
    margin: 0,
    paddingTop: 6,
    paddingBottom: 8
  },
  labelActive: {
    backgroundColor: 'transparent',
    fontSize: 10,
    color: Colors.blue,
    marginTop: 0
  },
  labelInactive: {
    backgroundColor: 'transparent',
    fontSize: 10,
    color: Colors.offWhite,
    marginTop: 0
  },
  iconActive: {
    backgroundColor: 'transparent',
    color: Colors.blue,
    margin: 0,
    padding: 0
  },
  iconInactive: {
    backgroundColor: 'transparent',
    color: Colors.purpleDarker,
    margin: 0,
    padding: 0
  },
  favSpacer: {
    marginBottom:4
  },
  indicator: {
    flex: 1,
    backgroundColor: Colors.purple,
    margin: 4,
    borderRadius: 4,
  },
  badge: {
    marginTop: 1,
    marginRight: 6,
    backgroundColor: Colors.transparentPurplest,
    height: 24,
    width: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4
  },
  count: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: -1,
  }
}