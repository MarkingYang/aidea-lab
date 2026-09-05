import { forceSimulation, forceLink, forceManyBody, forceCollide, forceX, forceY } from 'd3-force';

// Same physics for the build-time snapshot and direct manipulation in the browser.
// Classification is a weak spring; references hold the actual reading network together.
export function createGraphSimulation(nodes, links) {
  const strengths = { reference: .2, series: .4, keyword: .035, topic: .008, similarity: .015 };
  const distances = { reference: 45, series: 52, keyword: 85, topic: 160, similarity: 120 };
  return forceSimulation(nodes)
    .force('link', forceLink(links.filter(link => link.relation !== 'similarity').map(link => ({ ...link })))
      .id(node => node.id).distance(link => distances[link.relation])
      .strength(link => strengths[link.relation]))
    .force('charge', forceManyBody().strength(-100).distanceMax(650))
    .force('collision', forceCollide(13).iterations(2))
    .force('x', forceX(0).strength(.006))
    .force('y', forceY(0).strength(.022))
    .velocityDecay(.4).alphaDecay(.025).stop();
}
