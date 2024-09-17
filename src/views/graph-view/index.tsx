import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
// import './index.scss';
import { ClientPostMessageManager } from '../../ipc/client-ipc';
import { ClientToServerChannel, ServerToClientChannel } from '../../ipc/channels.enum';
import * as G6 from '@antv/g6';
import { FileNode } from '../../types/file-node';

const G6Graph = G6.Graph as any;

const App = () => {
    const ref = useRef(null);
    const graph = useRef<G6.Graph | null>(null);
    const clientIpc = ClientPostMessageManager.getInstance();
    console.log({ graph });

    useEffect(() => {
        // Request workspace files on component mount
        clientIpc.sendToServer(ClientToServerChannel.RequestWorkspaceFiles, {});

        // Listen for workspace files response
        clientIpc.onServerMessage(ServerToClientChannel.SendWorkspaceFiles, ({ files }) => {
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

            console.log({
                nodes,
                edges
            });
            if (!graph.current) {
                console.log({ graph });
                graph.current = new G6Graph({
                    container: ref.current,
                    width: window.innerWidth,
                    height: window.innerHeight,
                    modes: {
                        default: ['drag-canvas', 'zoom-canvas', 'drag-node'],
                    },
                    layout: {
                        type: 'dagre',
                        direction: 'LR',
                        nodesep: 5,
                        ranksep: 10,
                    },
                    fitView: true,
                    minZoom: 0.1,
                    maxZoom: 5,
                });

                handleEvents();

                console.log({ graph });

                graph.current.setData({
                    nodes: nodes.map(({ children, ...node }) => node),
                    edges
                });
                graph.current.render();
                // // Enable minimap
                // const minimap = new G6.Minimap({
                //     size: [150, 100],
                // });
                // graph.current.addPlugin(minimap);
                (graph.current as any).addBehaviors(
                    {
                      type: 'drag-canvas',
                      direction: 'y',
                    },
                    'edit',
                  );
            }
        });

        return () => {
            if (graph.current) {
                graph.current.destroy();
            }
        };
    }, []);

    const handleEvents = () => {
        if (!graph.current) return;

        graph.current.on('node:click', (evt: any) => {
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
        graph.current.on('node:dragstart', (event: any) => {
            (event.shape as any) = undefined;
            graph.current.emit('dragstart', event);
          });
          graph.current.on('node:drag', (event: any) => {
            (event.shape as any) = undefined;
            graph.current.emit('drag', event);
          });
          graph.current.on('node:dragend', (event: any) => {
            (event.shape as any) = undefined;
            graph.current.emit('dragend', event);
          });
          graph.current.on('edge:dragstart', (event: any) => {
            (event.shape as any) = undefined;
            graph.current.emit('dragstart', event);
          });
          graph.current.on('edge:drag', (event: any) => {
            (event.shape as any) = undefined;
            graph.current.emit('drag', event);
          });
          graph.current.on('edge:dragend', (event: any) => {
            (event.shape as any) = undefined;
            graph.current.emit('dragend', event);
          });
            // graph.current.on('combo:dragstart', (event: any) => {
            //     (event.shape as any) = undefined;
            //     graph.current.emit('dragstart', event);
            // });
        };

    return <div ref={ref} style={{ width: '100%', height: '100%' }}>
        <div>Loading...</div>
    </div>;
};

const root = ReactDOM.createRoot(document.getElementById('graph-view-root')!);
root.render(<App />);