import { readFile } from 'node:fs/promises';
import { newline, coord } from '../common/common.js';

function getNetwork(input) {
    let n = {}
    let lines = input.split(newline)
    lines.forEach(line => {
        let [firstHalf, secondHalf] = line.split('; ')
        let [label, rate] = firstHalf.split(' has flow rate=')
        label = label.split(' ')[1]
        rate = parseInt(rate);
        let [trash, neighbours] = secondHalf.split(' valves ')
        if (!neighbours) {
            [trash, neighbours] = secondHalf.split(' valve ')
        }
        neighbours = neighbours.split(', ').map(ref => ({
            ref: ref,
            cost: 1
        }))

        n[label] = {
            rate: rate,
            on: rate === 0,
            neighbours: neighbours
        }
    });
    return n
}

function dfs(node, network, cost, quality, path, paths) {
    if (cost == 30) {
        paths[path] = quality
        return;
    } if (cost > 30) {
        return;
    }

    if (!node.on) {
        node.on = true
        cost += 1
        quality += node.rate * (30 - cost)
    }
    let neighbours = node.neighbours.filter(x => !network[x.ref].on && (cost + x.cost) <= 30)
    neighbours.forEach((neighbour, i, ns) => {
        dfs(
            network[neighbour.ref],
            network,
            cost + neighbour.cost,
            quality,
            path + ` ${neighbour.ref}`,
            paths
        )
    })
    if (!neighbours.length) {

        paths[path] = quality
    }
    return paths
}

function fwpr(network, start) {
    let dist = {}
    let next = {}
    let checked = []
    let toCheck = [start]
    while (toCheck.length) {
        let c = toCheck.pop()
        dist[coord([c, c])] = 0
        next[coord([c, c])] = c
        network[c].neighbours.forEach(n => {
            dist[coord([c, n.ref])] = 1
            next[coord([c, n.ref])] = n.ref
            if (!checked.some(x => x == n.ref)) toCheck.push(n.ref)
        });
        checked.push(c)
    }
    let uniq = [...new Set(checked)]
    for (let k = 0; k < uniq.length; k++) {
        let kRef = uniq[k];
        for (let i = 0; i < uniq.length; i++) {
            let iRef = uniq[i];
            for (let j = 0; j < uniq.length; j++) {
                let jRef = uniq[j];
                let distIJ = dist[coord([iRef, jRef])] ? dist[coord([iRef, jRef])] : Number.MAX_VALUE
                let distIK = dist[coord([iRef, kRef])] ? dist[coord([iRef, kRef])] : Number.MAX_VALUE
                let distJK = dist[coord([kRef, jRef])] ? dist[coord([kRef, jRef])] : Number.MAX_VALUE
                if (distIJ > (distIK + distJK)) {
                    dist[coord([iRef, jRef])] = dist[coord([iRef, kRef])] + dist[coord([kRef, jRef])]
                    next[coord([iRef, jRef])] = next[coord([iRef, kRef])]
                }
            }
        }
    }
    return next
}

function path(next, u, v) {
    if (!next[coord([u, v])]) {
        return []
    }
    let p = []
    while (u != v) {
        u = next[coord([u, v])]
        p.push(u)
    }
    return p
}

function getValueNodes(network) {
    let result = ['AA']
    for (const key in network) {
        if (Object.hasOwnProperty.call(network, key)) {
            const node = network[key];
            if (node.rate) {
                result.push(key)
            }
        }
    }
    return result
}

function getSimplifiedNetwork(network, next, valueNodes) {
    let simplified = {};
    for (let i = 0; i < valueNodes.length; i++) {
        let from = valueNodes[i]
        simplified[from] = {
            rate: network[from].rate,
            on: network[from].on,
            neighbours: []
        }
        for (let j = 0; j < valueNodes.length; j++) {
            let to = valueNodes[j]
            if (from == to) continue
            let p = path(next, from, to)
            simplified[from].neighbours.push({
                ref: to,
                cost: p.length
            })
        }
    }
    return simplified
}

function part1(input) {
    let network = getNetwork(input)
    let next = fwpr(network, 'AA')
    let valueNodes = getValueNodes(network)
    let simplifiedNetwork = getSimplifiedNetwork(network, next, valueNodes)
    let result = dfs(simplifiedNetwork['AA'], simplifiedNetwork, 0, 0, '', [])

    // let test = path(next, 'AA', 'RU')
    return result
}

function run(input) {
    let result1, result2;

    result1 = part1(input)

    console.log(`16a: ${result1}`);
    console.log(`16b: ${result2}`);
}

function execute() {
    readFile('./day16/day16.txt').then(value => run(value.toString()));
}

export default { execute }