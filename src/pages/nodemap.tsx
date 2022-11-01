import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { select, xml, Delaunay, randomBates } from 'd3'
import * as d3 from 'd3'

type Props = {}

const NodeMap = (props: Props) => {
    const random = d3.randomNormal(0, 1)
    let randomdata = Array.from({ length: 100 }, () => [random(), random()])
    const [data, setData] = useState(randomdata)
    const svgRef = useRef<SVGSVGElement>(null)

    useEffect(() => {
        if (data !== undefined) { graph(data) }
    }, [data])

    const graph = (data: any) => {
        d3.selectAll("svg > *").remove();
        const svg: any = select(svgRef.current)

        const x: any = d3.scaleLinear([0, 1], [0, 100]);
        const y: any = d3.scaleLinear([0, 1], [0, 100]);

        const width = window.innerWidth;
        const height = window.innerHeight;

        svg
            .attr("viewBox", [-width / 2, -height / 2, width, height])
            .style("cursor", "crosshair");

        svg
            .append("defs")
            .append("style")
            .text(`circle.highlighted { stroke: orangred; fill: orangered; }`);

        const delaunay = d3.Delaunay.from<any>(data, d => x(d[0]), d => y(d[1]));


        const g = svg.append("g");

        const mesh = svg.append("path")
            .attr("fill", "none")
            .attr("stroke", "#ccc")
            .attr("stroke-width", 1)
            .attr("d", delaunay.render());

        const points = g
            .selectAll("circle")
            .data(data)
            .join("circle")
            .attr("cx", (d: any[]) => x(d[0]))
            .attr("cy", (d: any[]) => y(d[1]));

        let transform: { k: number; invert: (arg0: [number, number]) => any };

        const zoom = d3.zoom().on("zoom", e => {
            g.attr("transform", (transform = e.transform));
            mesh.attr("transform", (transform = e.transform));
            g.style("stroke-width", 3 / Math.sqrt(transform.k));
            points.attr("r", 3 / Math.sqrt(transform.k));
        });



        return svg
            //path setup
            .on("click", (event: any) => {
                let start = 0;
                start = delaunay.find(...d3.pointer(event));
            })
            .call(zoom)
            .call(zoom.transform, d3.zoomIdentity)
            //recalc on zoom 
            .on("pointermove", (event: any) => {
                const p: any = transform.invert(d3.pointer(event));
                const i = delaunay.find(...p);
                points.classed("highlighted", (_: any, j: number) => i === j);
                d3.select(points.nodes()[i]).raise();
                mesh.attr("d", delaunay.render())
            })
            .node();


    }

    return (
        <div>
            <svg className="h-5/6 w-screen" ref={svgRef}></svg>
            <button onClick={() => { randomdata = Array.from({ length: 100 }, () => [random(), random()]); setData(randomdata) }}>Update Data</button>
        </div>
    )
}

export default NodeMap
