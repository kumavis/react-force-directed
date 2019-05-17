const React = require('react')
const d3 = require('d3')
const { mergeGraph } = require('./build')
const { setupSimulationForces: defaultSetupSimulationForces, destroySimulation } = require('./simulation')
const renderGraph = require('./normal')


class ForceGraph extends React.Component {

  constructor () {
    super()
    // bind for event listener
    this.updateGraph = this.updateGraph.bind(this)
    this.triggerForceUpdate = this.triggerForceUpdate.bind(this)
  }

  componentDidMount () {
    // setup force simulation
    this.simulation = d3.forceSimulation()

    // setup update graph on change
    this.graph = { nodes: [], links: [], container: {}, container: { height: 0, width: 0 } }
    const { graphStore } = this.props
    graphStore.subscribe(this.updateGraph)
    this.updateGraph(graphStore.getState())

    // setup re-render on simulation update
    this.simulation.on('tick', this.triggerForceUpdate)
  }

  componentWillUnmount () {
    const { graphStore } = this.props
    graphStore.unsubscribe(this.updateGraph)
    
    // cleanup simulation and graph
    destroySimulation(this.simulation)
    delete this.simulation
    delete this.graph
  }

  triggerForceUpdate () {
    this.forceUpdate()
  }

  updateGraph (newGraph) {
    // merge with existing graph
    const currentGraph = this.graph
    const mergedGraph = mergeGraph(currentGraph, newGraph)
    this.graph = mergedGraph

    // reset simulation
    const setupSimulationForces = this.props.setupSimulationForces || defaultSetupSimulationForces
    setupSimulationForces(this.simulation, mergedGraph)
  }

  render () {
    const graph = this.graph
    if (!graph) return null

    return (
      renderGraph({ graph }, this.props.actions)
    )
  }
}

module.exports = ForceGraph

ForceGraph.createStyle = () => {
  return style(`
    .links line {
      stroke: #999;
      stroke-opacity: 0.6;
    }
  `)
}

function style (styleContent) {
  return (
    <style dangerouslySetInnerHTML={{__html: styleContent}} />
  )
}
