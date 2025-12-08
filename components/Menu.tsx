'use client';

import React, { useMemo } from 'react';
import { SVMChains } from "@pinax/token-api";
import Image from "next/image";
import { useChain } from '@/contexts/ChainContext';
import { useTheme } from '@/contexts/ThemeContext';

const cx = (...classes: string[]) => classes.filter(Boolean).join(" ");

interface MenuProps {
    onChangeDetails: () => void;
}

export default function Menu({ onChangeDetails }: MenuProps) {
    const { selectedChain, contract, setSelectedChain, setContract, tokens, chains } = useChain();
    const { isDarkMode, theme, toggleDarkMode } = useTheme();

    const tokenList = tokens[selectedChain] || [];

    // can only show contract input on non-solana chains
    const isSolana = useMemo(() => {
        return selectedChain === SVMChains.Solana;
    }, [selectedChain]);

    return (
        <div className="w-full flex justify-center pt-4 px-4 relative z-50">
            <div
                className={cx(
                    "flex items-center gap-10 px-8 py-5 rounded backdrop-blur-xl shadow w-full border",
                    // theme.glass,
                    isDarkMode
                        ? "black-glass"
                        : "white-glass text-white",
                )}
            >
                {/* Logo + Title */}
                <div className="flex items-center">
                    <Image src={'/logo.png'} alt={'logo'}
                             width={48} height={48}
                    />

                    <h1 className={cx("text-xl font-semibold", theme.textPrimary)}>
                        Hydro<span className="text-blue-500">Scan</span>
                    </h1>
                </div>

                <div className={cx("h-8 w-px", theme.divider)} />

                <section className="flex gap-3 flex-1">
                    {/* Blockchain Select */}
                    <div className="flex flex-col flex-1">
                        <select
                            className={cx(
                                "text-sm px-3 py-2 rounded focus:outline-none border capitalize",
                                theme.input
                            )}
                            value={selectedChain}
                            onChange={(e) => {
                                const chain = e.target.value;
                                setSelectedChain(chain);
                                const first = tokens[chain]?.[0];
                                setContract(first?.contract || "");
                            }}
                        >
                            {Object.keys(chains).map((key) => (
                                <option key={key} value={chains[key]} className="text-black">
                                    {key}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Token Select */}
                    <div className="flex flex-col">
                        <select
                            className={cx(
                                "text-sm px-3 py-2 rounded focus:outline-none border",
                                theme.input
                            )}
                            value={contract}
                            onChange={(e) => setContract(e.target.value)}
                        >
                            <option key="native" value="" className="text-black">
                                Native Token
                            </option>
                            {tokenList.map((t) => (
                                <option key={t.contract} value={t.contract} className="text-black">
                                    {t.symbol}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Contract Input */}
                    {!isSolana &&
                        <div className="flex flex-col w-full">
                            <input
                                type="text"
                                value={contract}
                                onChange={(e) => setContract(e.target.value)}
                                placeholder="Enter contract address"
                                className={cx(
                                    "text-sm px-3 py-2 rounded focus:outline-none border",
                                    theme.input
                                )}
                            />
                        </div>
                    }

                    {/* Button to Go! */}
                    <div className="flex flex-col justify-end flex-shrink-0">
                        <button
                            onClick={onChangeDetails}
                            className={cx(
                                "px-5 h-[39px] rounded font-medium text-sm transition cursor-pointer",
                                isDarkMode
                                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                                    : "bg-blue-500 hover:bg-blue-600 text-white"
                            )}
                        >
                            Go fish!
                        </button>
                    </div>
                </section>

                <div className={cx("h-8 w-px", theme.divider)} />

                {/* Dark Mode */}
                <div className="flex items-center gap-3 cursor-pointer" onClick={toggleDarkMode}>
                    <span className={cx("text-sm", theme.textPrimary)}>
                        <svg className="w-5" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M32.6366 0.102964C34.2371 -0.325866 35.882 0.623961 36.3108 2.2243L40.452 17.6791C40.8808 19.2796 39.9311 20.9245 38.3306 21.3533C36.7303 21.7821 35.0852 20.8324 34.6564 19.232L30.5153 3.77722C30.0865 2.17687 31.0363 0.531774 32.6366 0.102964ZM74.3631 11.1808C75.3086 10.9979 76.3433 11.2747 77.0756 12.007C78.2471 13.1785 78.2502 15.0727 77.0787 16.2443L65.747 27.5629C64.5754 28.7344 62.6812 28.7374 61.5096 27.5659C60.338 26.3943 60.335 24.5001 61.5065 23.3285L72.8382 12.0099C73.2775 11.5707 73.7958 11.2907 74.3631 11.1808ZM2.46197 30.4467C2.8862 30.3703 3.32443 30.395 3.77451 30.5155L19.2473 34.6518C20.8477 35.0807 21.7922 36.7226 21.3633 38.323C20.9345 39.9233 19.2925 40.8679 17.6922 40.4391L2.21938 36.3028C0.618959 35.8739 -0.325485 34.2318 0.103344 32.6315C0.371372 31.6313 1.12903 30.8741 2.03937 30.5599C2.17598 30.5129 2.32056 30.4721 2.46197 30.4467ZM39.8835 27.1489C49.4516 24.5852 59.3652 30.3087 61.929 39.8768C64.4927 49.4449 58.7691 59.3585 49.201 61.9223C39.633 64.486 29.7194 58.7624 27.1556 49.1943C24.5919 39.6262 30.3155 29.7127 39.8835 27.1489ZM41.4365 32.9445C35.0006 34.6689 31.2267 41.2056 32.9512 47.6414C34.6757 54.0773 41.2123 57.8512 47.6481 56.1267C54.084 54.4022 57.8579 47.8656 56.1334 41.4297C54.4089 34.9939 47.8723 31.22 41.4365 32.9445ZM70.0799 48.5632C70.5041 48.4872 70.9423 48.5112 71.3924 48.6322L86.8652 52.7684C88.4656 53.1973 89.4101 54.8392 88.9812 56.4397C88.5524 58.04 86.9105 58.9845 85.3101 58.5557L69.8373 54.4194C68.2369 53.9906 67.2925 52.3485 67.7213 50.7482C67.9893 49.748 68.747 48.9908 69.6573 48.6766C69.7939 48.6296 69.9385 48.5885 70.0799 48.5632ZM24.8625 60.6792C25.808 60.4962 26.8427 60.7732 27.575 61.5053C28.7465 62.6768 28.7496 64.571 27.5781 65.7427L16.2464 77.0612C15.0749 78.2327 13.1806 78.2357 12.0091 77.0612C10.8375 75.8896 10.8344 73.9955 12.006 72.8238L23.3376 61.5053C23.777 61.066 24.2952 60.7861 24.8625 60.6762V60.6792ZM50.754 67.7178C52.3544 67.289 53.9994 68.2388 54.4282 69.8391L58.5693 85.294C58.9981 86.8944 58.0484 88.5394 56.448 88.9682C54.8476 89.397 53.2026 88.4473 52.7737 86.8469L48.6326 71.3922C48.2038 69.7918 49.1536 68.1466 50.754 67.7178Z" fill="currentColor"/>
                        </svg>

                    </span>
                    <div
                        className={cx(
                            "w-10 h-5 rounded-full flex items-center px-1 border transition",
                            theme.toggleBg
                        )}
                    >
                        <div
                            className={cx(
                                "w-4 h-4 rounded-full transform transition",
                                theme.toggleDot,
                                isDarkMode ? "translate-x-4" : "-translate-x-0.5"
                            )}
                        ></div>
                    </div>
                    <span className={cx("text-sm", theme.textPrimary)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7.5 7.5 0 0021 12.79z" />
                        </svg>
                    </span>
                </div>

                {/* Go to Docs */}
                <div>
                    <a
                        href="https://thegraph.com/docs/en/token-api/quick-start/"
                        target="_blank"
                        className="px-4 py-2 rounded font-medium text-sm transition bg-white text-black hover:bg-blue-500 hover:text-white"
                    >
                        TokenAPI Docs
                    </a>
                </div>
            </div>
        </div>
    );
}
