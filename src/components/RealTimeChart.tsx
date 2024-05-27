import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import io from 'socket.io-client';
import { LoadingSpinner } from './ui/loading-spinner';

const RealTimeChart = () => {
  const chartRef = useRef();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const socketInitializer = async () => {
      setIsLoading(true);
      await fetch('/api/chart-data'); // Ensure the server is ready
      const socket = io();

      socket.on('connect', () => {
        console.log('connected');
      });

      socket.on('data-update', (newData) => {
        setData(prevData => [...prevData, newData]);
        setIsLoading(false);
      });

      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    };

    socketInitializer();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      const svg = d3.select(chartRef.current);

      const margin = { top: 20, right: 30, bottom: 30, left: 40 };
      const containerWidth = svg.node().parentNode.clientWidth;
      const containerHeight = svg.node().parentNode.clientHeight;
      const width = containerWidth - margin.left - margin.right;
      const height = containerHeight - margin.top - margin.bottom;

      svg.attr('width', containerWidth)
        .attr('height', containerHeight)
        .style('background-color', 'black')
        .style('border', '1px solid #000');

      const g = svg.selectAll('g').data([null]);
      g.enter().append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const x = d3.scaleTime()
        .domain(d3.extent(data, d => new Date(d.timestamp)))
        .range([0, width]);

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)]).nice()
        .range([height, 0]);

      const line = d3.line()
        .x(d => x(new Date(d.timestamp)))
        .y(d => y(d.value))
        .curve(d3.curveMonotoneX);

      g.selectAll('path').data([data])
        .join(
          enter => enter.append('path')
            .attr('fill', 'none')
            .attr('stroke', 'orange')
            .attr('stroke-width', 1.5)
            .attr('d', line),
          update => update.attr('d', line)
        );

      g.selectAll('.x-axis').data([null])
        .join('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0)).attr('color', 'grey');
      
    //Add a line for the current Value
    const lastValue = data[data.length - 1].value;
    g.selectAll('.baseline').data([null])
      .join('line')
      .attr('class', 'baseline')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', y(lastValue))
      .attr('y2', y(lastValue))
      .attr('stroke', 'green')
      .attr('stroke-width', 1);

    
      // Split the data into two arrays: one for the values above the baseline and one for the values below the baseline
const dataAbove = data.filter(d => d.value >= lastValue);
const dataBelow = data.filter(d => d.value < lastValue);

// Create a line generator
// const line2 = d3.line()
//   .x(d => x(new Date(d.timestamp)))
//   .y(d => y(d.value))
//   .curve(d3.curveMonotoneX);

// // Draw the line for the values above the baseline
// g.selectAll('.line-above').data([dataAbove])
//   .join('path')
//   .attr('class', 'line-above')
//   .attr('fill', 'none')
//   .attr('stroke', 'pink') // Use pink for the values above the baseline
//   .attr('stroke-width', 1.5)
//   .attr('d', line2);

// // Draw the line for the values below the baseline
// g.selectAll('.line-below').data([dataBelow])
//   .join('path')
//   .attr('class', 'line-below')
//   .attr('fill', 'none')
//   .attr('stroke', 'orange') // Use orange for the values below the baseline
//   .attr('stroke-width', 1.5)
//   .attr('d', line2);

     g.selectAll('.y-axis').data([null])
      .join('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${width},0)`) // Translate the y-axis to the right by the width of the chart
      .call(d3.axisRight(y))
      .attr('color', 'grey');
    }
  }, [data]);

  return (
    <div className="w-full h-96 md:h-[500px] lg:h-[600px]">
      {isLoading?
      <div className='w-full h-96 md:h-[500px] lg:h-[600px] flex items-center justify-center'>
      <LoadingSpinner />
      </div>: <svg ref={chartRef}></svg>}
     
    </div>
  );
};

export default RealTimeChart;