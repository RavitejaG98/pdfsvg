import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Line, Transformer } from 'react-konva';

const Arrow = ({ shapeRef, ...props }) => {
  const arrowSize = 10;
  const [points, setPoints] = useState(props.points || [50, 50, 200, 200]);

  const angle = Math.atan2(points[3] - points[1], points[2] - points[0]);

  const arrowheadPoints = [
    points[2], points[3],
    points[2] - arrowSize * Math.cos(angle - Math.PI / 6), points[3] - arrowSize * Math.sin(angle - Math.PI / 6),
    points[2] - arrowSize * Math.cos(angle + Math.PI / 6), points[3] - arrowSize * Math.sin(angle + Math.PI / 6),
  ];

  useEffect(() => {
    if (shapeRef.current) {
      const node = shapeRef.current;
      // Update points to reflect any changes
      node.points(points);
    }
  }, [points, shapeRef]);

  return (
    <>
      <Line
        ref={shapeRef}
        points={points}
        stroke={props.stroke}
        strokeWidth={props.strokeWidth}
        lineCap="round"
        lineJoin="round"
        draggable
        onDragEnd={(e) => {
          // Update points based on the new position
          const node = shapeRef.current;
          const newPoints = node.points();
          setPoints(newPoints);
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          setPoints(node.points());
        }}
      />
      <Line
        points={arrowheadPoints}
        fill={props.stroke}
        closed
        strokeWidth={props.strokeWidth}
        lineCap="round"
        lineJoin="round"
      />
    </>
  );
};

const ArrowComponent = () => {
  const shapeRef = useRef(null);
  const transformerRef = useRef(null);

  useEffect(() => {
    if (transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [shapeRef.current, transformerRef.current]);

  const handleExport = () => {
    if (shapeRef.current) {
      const stage = shapeRef.current.getStage();
      const arrow = shapeRef.current;

      // Apply transformations
      const transform = arrow.getTransform();
      const absoluteTransform = transform.getMatrix().toString();
      const scaleX = arrow.scaleX();
      const scaleY = arrow.scaleY();
      const rotation = arrow.rotation();

      const points = arrow.points().reduce((acc, point, index) => {
        if (index % 2 === 0) acc.push(`${point},`);
        else acc[acc.length - 1] += `${point} `;
        return acc;
      }, []).join(' ');

      const angle = Math.atan2(arrow.points()[3] - arrow.points()[1], arrow.points()[2] - arrow.points()[0]);
      const arrowSize = 10;
      const arrowheadPoints = [
        `${arrow.points()[2]},${arrow.points()[3]}`,
        `${arrow.points()[2] - arrowSize * Math.cos(angle - Math.PI / 6)},${arrow.points()[3] - arrowSize * Math.sin(angle - Math.PI / 6)}`,
        `${arrow.points()[2] - arrowSize * Math.cos(angle + Math.PI / 6)},${arrow.points()[3] - arrowSize * Math.sin(angle + Math.PI / 6)}`,
      ].join(' ');

      const svgContent = `
        <polyline points="${points.trim()}" style="fill:none;stroke:${arrow.stroke()};stroke-width:${arrow.strokeWidth()}px;" transform="matrix(${transform.getMatrix().join(' ')})" />
        <polygon points="${arrowheadPoints}" style="fill:${arrow.stroke()};stroke:none;" transform="matrix(${transform.getMatrix().join(' ')})" />
      `;

      const svgString = `
        <svg width="${stage.width()}" height="${stage.height()}" xmlns="http://www.w3.org/2000/svg">
          ${svgContent}
        </svg>
      `;

      const link = document.createElement('a');
      link.download = 'arrow.svg';
      link.href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
      link.click();
    }
  };

  return (
    <div>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onClick={() => {
          if (transformerRef.current) {
            transformerRef.current.nodes([shapeRef.current]);
            transformerRef.current.getLayer().batchDraw();
          }
        }}
      >
        <Layer>
          <Arrow
            shapeRef={shapeRef}
            points={[50, 50, 200, 200]} // Start and end points of the arrow
            stroke="black"
            strokeWidth={5}
          />
          <Transformer
            ref={transformerRef}
          />
        </Layer>
      </Stage>
      <button onClick={handleExport}>Export as SVG</button>
    </div>
  );
};

export default ArrowComponent;
