import lab from "../lib/lab";

var generationSettings = {
  subdivisions: 20,
  distortionLevel: 1,
  plateCount: 36,
  oceanicRate: 0.7,
  heatLevel: 1.0,
  moistureLevel: 1.0,
  seed: null
};

export default class New extends React.Component {
  // fetch old packages data from the server
  static async getInitialProps({ req }) {
    return {};
  }

  static defaultProps = {};

  state = {};

  componentDidMount() {
    let test = lab.generateSubdividedIcosahedron(20);
    console.log(test);
  }

  render() {
    return <div />;
  }
}
