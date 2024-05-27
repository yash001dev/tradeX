import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import io from 'socket.io-client';
import { LoadingSpinner } from './ui/loading-spinner';
import { Socket } from 'socket.io';

interface DataType {
  timestamp: string;
  value: number;
}

const RealTimeChart: React.FC = () => {
  const chartRef = useRef<SVGSVGElement | null>(null);
  const socketRef = useRef<any>(null);
  const [data, setData] = useState<DataType[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const socketInitializer = async () => {
      setIsLoading(true);
      await fetch('/api/chart-data'); // Ensure the server is ready

      if (!socketRef.current) {
        const socket = io();
        socketRef.current = socket;

        socket.on('connect', () => {
          console.log('connected');
        });

        socket.on('data-update', (newData: DataType) => {
          console.log('newData', newData);
          setData((prevData) => [...prevData, newData]);
          setIsLoading(false);
        });

        socket.on('disconnect', () => {
          console.log('disconnected');
        });
      }
    };

    socketInitializer();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (data.length > 0 && chartRef.current) {
      const svg = d3.select(chartRef.current);

      const margin = { top: 20, right: 30, bottom: 30, left: 40 };
      const containerWidth = (svg.node()?.parentNode as Element)?.clientWidth ?? 0;
const containerHeight = (svg.node()?.parentNode as Element)?.clientHeight ?? 0;
      const width = containerWidth - margin.left - margin.right;
      const height = containerHeight - margin.top - margin.bottom;

      svg.attr('width', containerWidth)
        .attr('height', containerHeight)
        .style('background-color', 'black')
        .style('border', '1px solid #000');

      const g = svg.selectAll<SVGGElement, unknown>('g').data([null]);
      g.enter().append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const x = d3.scaleTime()
        .domain(d3.extent(data, d => new Date(d.timestamp)) as [Date, Date])
        .range([0, width]);

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)] as [number, number])
        .range([height, 0]);

      const line = d3.line<DataType>()
        .x(d => x(new Date(d.timestamp)))
        .y(d => y(d.value))
        .curve(d3.curveMonotoneX);

      // Define the filter
      g.append('defs')
        .append('filter')
        .attr('id', 'glow')
        .append('feGaussianBlur')
        .attr('stdDeviation', '8')
        .attr('result', 'coloredBlur');

      const feMerge = g.select('filter')
        .append('feMerge');

      feMerge.append('feMergeNode')
        .attr('in', 'coloredBlur');
      feMerge.append('feMergeNode')
        .attr('in', 'SourceGraphic');

      // Apply the filter to the path
      g.selectAll<SVGPathElement, DataType[]>('path').data([data])
        .join(
          enter => enter.append('path')
            .attr('fill', 'none')
            .attr('stroke', 'orange')
            .attr('stroke-width', 1.5)
            .attr('filter', 'url(#glow)') // Apply the filter
            .attr('d', line),
          update => update.attr('d', line)
        );

      g.selectAll<SVGGElement, unknown>('.x-axis').data([null])
        .join('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
        .attr('color', 'grey');

      const lastValue = data[data.length - 1].value;

      // Define the gradient
const defs = g.append('defs');

const gradient = defs.append('linearGradient')
  .attr('id', 'gradient')
  .attr('x1', '0%')
  .attr('y1', '0%')
  .attr('x2', '0%')
  .attr('y2', '100%');

gradient.append('stop')
  .attr('offset', '0%')
  .attr('style', 'stop-color:green;stop-opacity:0.3');

gradient.append('stop')
  .attr('offset', '100%')
  .attr('style', 'stop-color:green;stop-opacity:0');

  // Create the rectangle
let rect2 = g.selectAll<SVGRectElement, unknown>('.gradient-rect').data([null]);

rect2 = rect2.enter().append('rect')
  .attr('class', 'gradient-rect')
  .attr('x', 0)
  .attr('y', 0)
  .attr('width', width)
  .attr('fill', 'url(#gradient)')
  .merge(rect2);

// Update the height of the rectangle when the baseline changes
    rect2.attr('height', y(lastValue));
      
      g.selectAll<SVGLineElement, unknown>('.baseline').data([null])
        .join('line')
        .attr('class', 'baseline')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', y(lastValue))
        .attr('y2', y(lastValue))
        .attr('stroke', 'darkgreen')
        .attr('stroke-width', 2);

      g.selectAll<SVGGElement, unknown>('.y-axis').data([null])
        .join('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${width},0)`)
        .call(d3.axisRight(y))
        .attr('color', 'grey');

      
      
  // Inside the second useEffect hook
const yAxis = g.selectAll<SVGGElement, unknown>('.y-axis').data([null])
  .join('g')
  .attr('class', 'y-axis')
  .attr('transform', `translate(${width},0)`)
  .call(d3.axisRight(y))
  .attr('color', 'grey');

// Append the rectangle if it doesn't exist
let rect = yAxis.selectAll<SVGRectElement, unknown>('.y-axis-label-rect').data([null]);
rect = rect.enter().append('rect')
  .attr('class', 'y-axis-label-rect')
  .attr('x', -25)
  .attr('height', '20px')
  .attr('width', '50px')
  .attr('fill', 'orange')
  .attr('stroke', 'black') // Set the border color to black
  .attr('stroke-width', '0.5px') // Increase the border width
   .attr('rx', '5px') // Set the x-axis radius of the ellipse used to round off the corners of the rectangle
  .attr('ry', '5px') // Set the y-axis radius of the ellipse used to round off the corners of the rectangle
  .merge(rect);

// Append the label if it doesn't exist
let label = yAxis.selectAll<SVGTextElement, unknown>('.y-axis-label').data([null]);
label = label.enter().append('text')
  .attr('class', 'y-axis-label')
  .attr('dy', '0.40em')
  .attr('fill', 'black') // Set the text color to black
  .attr('text-anchor', 'middle') // Center the text
  .attr('font-size', '10px') // Increase the font size
  .merge(label);

// Update the y attribute and text of the rectangle and label
rect.attr('y', d => y(data[data.length - 1].value) - 10); // Adjust the y attribute
label.attr('y', d => y(data[data.length - 1].value)) // Adjust the y attribute
  .attr('x', -25 + 25) // Center the text in the rectangle
  .text(data[data.length - 1].value.toFixed(2)); // Update the text
    }
  }, [data]);
  

  return (
    <div className="w-full h-screen md:h-[500px] lg:h-[600px]">
      {isLoading ? (
        <div className='w-full h-96 md:h-[500px] lg:h-[600px] flex items-center justify-center'>
          <LoadingSpinner />
        </div>
      ) : (
        <svg ref={chartRef}></svg>
      )}
    </div>
  );
};

export default RealTimeChart;
