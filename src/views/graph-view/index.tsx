import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
// import './index.scss';
import { ClientPostMessageManager } from '../../ipc/client-ipc';
import { ClientToServerChannel, ServerToClientChannel } from '../../ipc/channels.enum';
import * as G6 from '@antv/g6';
import { FileNode } from '../../types/file-node';

const App = () => {
    const ref = useRef(null);
    let graph = null;
    const clientIpc = ClientPostMessageManager.getInstance();

    useEffect(() => {
        // Request workspace files on component mount
        clientIpc.sendToServer(ClientToServerChannel.RequestWorkspaceFiles, {});

        // Listen for workspace files response
        clientIpc.onServerMessage(ServerToClientChannel.SendWorkspaceFiles, ({ files }) => {
            console.log({ files });
            // since the data is hierarchical (with parent-child relationships), we need to flatten it
            const flatCB = (node: FileNode, acc: (FileNode & { id: string })[]) => {
                acc.push({
                    id: node.absolutePath,
                    ...node,
                });
                (node.children || []).forEach((child) => flatCB(child, acc));
                return acc;
            };
            const nodes = files.reduce((acc, file) => flatCB(file, acc), [] as (FileNode & { id: string })[]);
                
            const edges = nodes.reduce((acc, file) => {
                if (file.children) {
                    file.children.forEach((child) => {
                        acc.push({
                            source: file.absolutePath,
                            target: child.absolutePath,
                        });
                    });
                }
                return acc;
            }, [] as { source: string; target: string }[]);

            if (!graph) {
                graph = new G6.Graph({
                    container: ref.current,
                    width: window.innerWidth,
                    height: window.innerHeight,
                    // modes: {
                    //     default: ['drag-canvas', 'zoom-canvas', 'drag-node'],
                    // },
                    layout: {
                        type: 'dagre',
                        direction: 'LR',
                        nodesep: 50,
                        ranksep: 100,
                    },
                    // defaultNode: {
                    //     shape: 'rect',
                    //     labelCfg: {
                    //         style: {
                    //             fill: '#000000A6',
                    //             fontSize: 10,
                    //         },
                    //     },
                    //     style: {
                    //         stroke: '#72CC4A',
                    //         width: 150,
                    //     },
                    // },
                    // defaultEdge: {
                    //     shape: 'polyline',
                    // },
                });

                graph.on('node:click', (evt) => {
                    const node = evt.item;
                    const model = node.getModel();
                    clientIpc.sendToServer(ClientToServerChannel.SendSelectedEditor, {
                        editor: {
                            fileName: model.label,
                            filePath: model.id,
                            languageId: '', // You might need to determine the languageId here
                        },
                    });
                });

                console.log({ graph });

                graph.setData({ nodes, edges });
                graph.render();
            }
        });

        return () => {
            if (graph) {
                graph.destroy();
            }
        };
    }, []);

    return <div ref={ref} style={{ width: '100%', height: '100%' }}>
        <div>Loading...</div>
    </div>;
};

const root = ReactDOM.createRoot(document.getElementById('graph-view-root')!);
root.render(<App />);