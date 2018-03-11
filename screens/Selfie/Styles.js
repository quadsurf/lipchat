

import { getDimensions } from '../../utils/Helpers'

const { width,height } = getDimensions()
const landmarkSize = 6

export default {
  container: {
    width,height,
    // backgroundColor: 'transparent'
    // flex: 1,
  },
  facesContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    top: 0,
  },
  face: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 2,
    position: 'absolute',
    borderColor: '#FFD700',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  landmark: {
    width: landmarkSize,
    height: landmarkSize,
    position: 'absolute'
  },
  faceText: {
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
    backgroundColor: 'transparent',
  }
}