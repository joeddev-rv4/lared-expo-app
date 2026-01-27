import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Rect, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';

interface SparklineProps {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
    strokeWidth?: number;
    strokeWidth?: number;
    type?: 'line' | 'bar' | 'area' | 'curved' | 'gauge' | 'arc' | 'donut';
}

export const Sparkline = ({
    data,
    width = 60,
    height = 30,
    color = '#044bb8',
    strokeWidth = 2,
    type = 'line',
}: SparklineProps) => {
    if (!data || data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((val, i) => ({
        x: (i / (data.length - 1)) * width,
        y: height - ((val - min) / range) * height,
    }));

    const getLinePath = (pts: { x: number, y: number }[]) => {
        return `M ${pts.map(p => `${p.x},${p.y}`).join(' L ')}`;
    };

    const getCurvedPath = (pts: { x: number, y: number }[]) => {
        if (pts.length < 2) return '';
        let path = `M ${pts[0].x},${pts[0].y}`;

        for (let i = 0; i < pts.length - 1; i++) {
            const p1 = pts[i];
            const p2 = pts[i + 1];
            const cp1x = p1.x + (p2.x - p1.x) / 3;
            const cp2x = p1.x + (p2.x - p1.x) * 2 / 3;
            path += ` C ${cp1x},${p1.y} ${cp2x},${p2.y} ${p2.x},${p2.y}`;
        }
        return path;
    };

    const isSmooth = type === 'curved' || type === 'area';
    const pathData = isSmooth ? getCurvedPath(points) : getLinePath(points);

    return (
        <View style={{ width, height }}>
            <Svg width={width} height={height}>
                <Defs>
                    <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={color} stopOpacity="0.4" />
                        <Stop offset="1" stopColor={color} stopOpacity="0" />
                    </LinearGradient>
                </Defs>

                {type === 'area' && (
                    <Path
                        d={`${pathData} L ${width},${height} L 0,${height} Z`}
                        fill="url(#grad)"
                    />
                )}

                {(type === 'line' || type === 'area' || type === 'curved') && (
                    <Path
                        d={pathData}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                )}

                {type === 'bar' && data.map((val, i) => {
                    const barWidth = (width / data.length) * 0.7;
                    const x = (i / data.length) * width;
                    const h = ((val - min) / range) * height || 2;
                    return (
                        <Rect
                            key={i}
                            x={x}
                            y={height - h}
                            width={barWidth}
                            height={h}
                            fill={color}
                            rx={1}
                        />
                    );
                })}

                {type === 'gauge' && (() => {
                    const radius = Math.min(width / 2, height) - strokeWidth;
                    const centerX = width / 2;
                    const centerY = height;
                    const [current, total] = data.length >= 2 ? [data[0], data[1]] : [data[0], max];
                    const percentage = Math.min(Math.max(current / total, 0), 10); // Handle over 100% too
                    const angle = Math.min(percentage, 1) * Math.PI; // 0 to PI (180 deg)

                    const endX = centerX - radius * Math.cos(angle);
                    const endY = centerY - radius * Math.sin(angle);

                    const largeArcFlag = angle > Math.PI ? 1 : 0;

                    return (
                        <>
                            {/* Background Arc */}
                            <Path
                                d={`M ${centerX - radius},${centerY} A ${radius},${radius} 0 0 1 ${centerX + radius},${centerY}`}
                                fill="none"
                                stroke="#f1f1f1"
                                strokeWidth={strokeWidth}
                                strokeLinecap="round"
                            />
                            {/* Progress Arc */}
                            <Path
                                d={`M ${centerX - radius},${centerY} A ${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY}`}
                                fill="none"
                                stroke={color}
                                strokeWidth={strokeWidth}
                                strokeLinecap="round"
                            />
                        </>
                    );
                })()}

                {type === 'arc' && (() => {
                    const radius = Math.min(width, height) / 2 - strokeWidth;
                    const centerX = width / 2;
                    const centerY = height / 2;
                    const [current, total] = data.length >= 2 ? [data[0], data[1]] : [data[0], max || 100];
                    const percentage = Math.min(Math.max(current / total, 0), 1);
                    const circumference = 2 * Math.PI * radius;
                    const strokeDashoffset = circumference - percentage * circumference;

                    return (
                        <>
                            <Circle
                                cx={centerX}
                                cy={centerY}
                                r={radius}
                                stroke="#f1f1f1"
                                strokeWidth={strokeWidth}
                                fill="none"
                            />
                            <Circle
                                cx={centerX}
                                cy={centerY}
                                r={radius}
                                stroke={color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                fill="none"
                                transform={`rotate(-90 ${centerX} ${centerY})`}
                            />
                        </>
                    );
                })()}

                {type === 'donut' && (() => {
                    const radius = Math.min(width, height) / 2 - (strokeWidth * 1.5);
                    const centerX = width / 2;
                    const centerY = height / 2;
                    const [current, total] = data.length >= 2 ? [data[0], data[1]] : [data[0], max || 100];
                    const percentage = Math.min(Math.max(current / total, 0), 1);
                    const circumference = 2 * Math.PI * radius;

                    // Segmented background for "counting" effect
                    const segments = 10;
                    const segmentGap = 2;
                    const segmentLength = (circumference / segments) - segmentGap;

                    return (
                        <>
                            {Array.from({ length: segments }).map((_, i) => {
                                const offset = (i / segments) * circumference;
                                const isFilled = (i / segments) < percentage;
                                return (
                                    <Circle
                                        key={i}
                                        cx={centerX}
                                        cy={centerY}
                                        r={radius}
                                        stroke={isFilled ? color : "#f1f1f1"}
                                        strokeWidth={strokeWidth * 2}
                                        strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                                        strokeDashoffset={-offset}
                                        fill="none"
                                        transform={`rotate(-90 ${centerX} ${centerY})`}
                                    />
                                );
                            })}
                        </>
                    );
                })()}
            </Svg>
        </View>
    );
};
