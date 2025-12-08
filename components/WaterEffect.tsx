'use client';

import React from "react";

export default function WaterEffect({
                                        children,
                                        style = {},
                                        className = "",
                                        scale = 20,             // how strong the distortion is
                                        baseFreq = "0.01 0.02", // turbulence frequency
                                        speed = 8               // animation duration in seconds
                                    }: {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    scale?: number;
    baseFreq?: string;
    speed?: number;
}) {
    const filterId = React.useId();

    return (
        <div className={className} style={style}>
            <svg width="0" height="0">
                <filter id={filterId}>
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency={baseFreq}
                        numOctaves="3"
                        seed="2"
                        result="noise"
                    >
                        <animate
                            attributeName="baseFrequency"
                            dur={`${speed}s`}
                            values={`${baseFreq}; 0.02 0.04; ${baseFreq}`}
                            repeatCount="indefinite"
                        />
                    </feTurbulence>

                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale={scale}
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>
            </svg>

            {/* Content that gets distorted */}
            <div className={className} style={{ filter: `url(#${filterId})` }}>
                {children}
            </div>
        </div>
    );
}