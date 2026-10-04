import React, { useState, useEffect, useContext, useRef } from 'react'
import { UserContext } from '../context/user.context'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from '../config/axios'
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket'
import Markdown from 'markdown-to-jsx'
import hljs from 'highlight.js';
import { getWebContainer } from '../config/webContainer'
import ThemeToggle from '../components/ThemeToggle'


function SyntaxHighlightedCode(props) {
    const ref = useRef(null)

    React.useEffect(() => {
        if (ref.current && props.className?.includes('lang-') && window.hljs) {
            window.hljs.highlightElement(ref.current)

            // hljs won't reprocess the element unless this attribute is removed
            ref.current.removeAttribute('data-highlighted')
        }
    }, [ props.className, props.children ])

    return <code {...props} ref={ref} />
}


const Project = () => {

    const location = useLocation()

    const [ isSidePanelOpen, setIsSidePanelOpen ] = useState(false)
    const [ isModalOpen, setIsModalOpen ] = useState(false)
    const [ selectedUserId, setSelectedUserId ] = useState(new Set()) // Initialized as Set
    const [ project, setProject ] = useState(location.state.project)
    const [ message, setMessage ] = useState('')
    const { user } = useContext(UserContext)
    const messageBox = React.createRef()

    const [ users, setUsers ] = useState([])
    const [ messages, setMessages ] = useState([]) // New state variable for messages
    const [ fileTree, setFileTree ] = useState({})

    const [ currentFile, setCurrentFile ] = useState(null)
    const [ openFiles, setOpenFiles ] = useState([])

    const [ webContainer, setWebContainer ] = useState(null)
    const [ iframeUrl, setIframeUrl ] = useState(null)

    const [ runProcess, setRunProcess ] = useState(null)

    // UI-only state (no effect on app logic)
    const [ isWorkspaceOpen, setIsWorkspaceOpen ] = useState(false)
    const bottomRef = useRef(null)
    const navigate = useNavigate()

    const handleUserClick = (id) => {
        setSelectedUserId(prevSelectedUserId => {
            const newSelectedUserId = new Set(prevSelectedUserId);
            if (newSelectedUserId.has(id)) {
                newSelectedUserId.delete(id);
            } else {
                newSelectedUserId.add(id);
            }

            return newSelectedUserId;
        });


    }


    function addCollaborators() {

        axios.put("/projects/add-user", {
            projectId: location.state.project._id,
            users: Array.from(selectedUserId)
        }).then(res => {
            console.log(res.data)
            setIsModalOpen(false)

        }).catch(err => {
            console.log(err)
        })

    }

    const send = () => {

        sendMessage('project-message', {
            message,
            sender: user
        })
        setMessages(prevMessages => [ ...prevMessages, { sender: user, message } ]) // Update messages state
        setMessage("")

    }

    function WriteAiMessage(message) {

        const messageObject = JSON.parse(message)

        return (
            <div className='ai-md overflow-auto'>
                <Markdown
                    children={messageObject.text}
                    options={{
                        overrides: {
                            code: SyntaxHighlightedCode,
                        },
                    }}
                />
            </div>)
    }

    useEffect(() => {

        initializeSocket(project._id)

        if (!webContainer) {
            getWebContainer().then(container => {
                setWebContainer(container)
                console.log("container started")
            })
        }


        receiveMessage('project-message', data => {

            console.log(data)
            
            if (data.sender._id == 'ai') {


                const message = JSON.parse(data.message)

                console.log(message)

                webContainer?.mount(message.fileTree)

                if (message.fileTree) {
                    setFileTree(message.fileTree || {})
                    setIsWorkspaceOpen(true)
                }
                setMessages(prevMessages => [ ...prevMessages, data ]) // Update messages state
            } else {


                setMessages(prevMessages => [ ...prevMessages, data ]) // Update messages state
            }
        })


        axios.get(`/projects/get-project/${location.state.project._id}`).then(res => {

            console.log(res.data.project)

            setProject(res.data.project)
            setFileTree(res.data.project.fileTree || {})
        })

        axios.get('/users/all').then(res => {

            setUsers(res.data.users)

        }).catch(err => {

            console.log(err)

        })

    }, [])

    // keep the newest message in view
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [ messages ])

    function saveFileTree(ft) {
        axios.put('/projects/update-file-tree', {
            projectId: project._id,
            fileTree: ft
        }).then(res => {
            console.log(res.data)
        }).catch(err => {
            console.log(err)
        })
    }


    // Removed appendIncomingMessage and appendOutgoingMessage functions

    function scrollToBottom() {
        messageBox.current.scrollTop = messageBox.current.scrollHeight
    }

    const iconBtn = 'h-9 w-9 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors'

    return (
        <main className='h-screen w-screen flex overflow-hidden bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-100'>

            {/* ============ CHAT (full screen by default) ============ */}
            <section className={`left relative flex-col h-screen bg-white dark:bg-zinc-950 ${isWorkspaceOpen ? 'hidden md:flex md:w-[400px] lg:w-[440px] shrink-0 border-r border-slate-200 dark:border-zinc-800' : 'flex flex-grow'}`}>

                <header className='flex justify-between items-center gap-3 px-4 h-16 shrink-0 w-full border-b border-slate-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80 z-10'>
                    <div className='flex items-center gap-3 min-w-0'>
                        <button onClick={() => navigate('/')} className={iconBtn} title='Back to projects'>
                            <i className="ri-arrow-left-line"></i>
                        </button>
                        <div className='min-w-0'>
                            <h1 className='font-semibold truncate leading-tight'>{project.name || 'Project'}</h1>
                            <p className='text-xs text-slate-500 dark:text-zinc-400'>
                                {project.users ? project.users.length : 0} collaborator{project.users && project.users.length === 1 ? '' : 's'}
                            </p>
                        </div>
                    </div>

                    <div className='flex items-center gap-2'>
                        <button
                            onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
                            className={`relative inline-flex items-center gap-2 h-9 px-3 rounded-xl border text-sm font-medium transition-colors ${isWorkspaceOpen ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'}`}
                            title='Toggle code workspace'>
                            <i className="ri-code-s-slash-line"></i>
                            <span className='hidden sm:inline'>Code</span>
                            {Object.keys(fileTree).length > 0 && (
                                <span className='h-5 min-w-5 px-1 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center'>{Object.keys(fileTree).length}</span>
                            )}
                        </button>
                        <button className={iconBtn} onClick={() => setIsModalOpen(true)} title='Add collaborator'>
                            <i className="ri-user-add-line"></i>
                        </button>
                        <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className={iconBtn} title='Collaborators'>
                            <i className="ri-group-line"></i>
                        </button>
                        <ThemeToggle />
                    </div>
                </header>

                <div className="conversation-area flex-grow flex flex-col min-h-0 relative">

                    <div
                        ref={messageBox}
                        className="message-box flex-grow overflow-y-auto px-4 py-6">
                        <div className='mx-auto w-full max-w-3xl flex flex-col gap-5'>

                            {messages.length === 0 && (
                                <div className='mt-24 text-center text-slate-500 dark:text-zinc-400'>
                                    <div className='mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/25'>
                                        <i className="ri-sparkling-2-fill"></i>
                                    </div>
                                    <h2 className='mt-5 text-xl font-semibold text-slate-900 dark:text-white'>Start the conversation</h2>
                                    <p className='mt-1 text-sm'>Type a message below. Mention <span className='font-medium text-indigo-600 dark:text-indigo-400'>@ai</span> to ask the AI to build something.</p>
                                </div>
                            )}

                            {messages.map((msg, index) => {
                                const isAi = msg.sender._id === 'ai'
                                const isMine = msg.sender._id == user._id.toString()

                                return (
                                    <div key={index} className={`message flex gap-3 ${isMine ? 'flex-row-reverse' : ''}`}>
                                        <div className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold text-white ${isAi ? 'bg-gradient-to-br from-indigo-500 to-fuchsia-500' : isMine ? 'bg-slate-700 dark:bg-zinc-700' : 'bg-emerald-600'}`}>
                                            {isAi ? <i className="ri-sparkling-2-fill"></i> : (msg.sender.email?.[0] || '?').toUpperCase()}
                                        </div>

                                        <div className={`flex flex-col min-w-0 ${isAi ? 'max-w-[calc(100%-3rem)] w-full' : 'max-w-[80%]'} ${isMine ? 'items-end' : 'items-start'}`}>
                                            <small className='mb-1 px-1 text-xs text-slate-500 dark:text-zinc-400'>{isAi ? 'AI Assistant' : isMine ? 'You' : msg.sender.email}</small>
                                            <div className={`text-sm rounded-2xl px-4 py-2.5 shadow-sm ${isAi
                                                ? 'w-full bg-slate-100 text-slate-900 rounded-tl-md dark:bg-zinc-900 dark:text-zinc-100 border border-slate-200 dark:border-zinc-800'
                                                : isMine
                                                    ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-tr-md'
                                                    : 'bg-white text-slate-900 border border-slate-200 rounded-tl-md dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800'}`}>
                                                {isAi ?
                                                    WriteAiMessage(msg.message)
                                                    : <p className='whitespace-pre-wrap break-words'>{msg.message}</p>}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            <div ref={bottomRef}></div>
                        </div>
                    </div>

                    <div className="inputField shrink-0 px-4 pb-5 pt-2 bg-gradient-to-t from-white via-white to-transparent dark:from-zinc-950 dark:via-zinc-950">
                        <div className='mx-auto w-full max-w-3xl flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 pl-4 shadow-lg shadow-slate-200/50 focus-within:ring-2 focus-within:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none'>
                            <input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && message.trim()) send() }}
                                className='flex-grow bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 dark:text-white dark:placeholder-zinc-500' type="text" placeholder='Message your team or @ai ...' />
                            <button
                                onClick={send}
                                disabled={!message.trim()}
                                className='h-10 w-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition'><i className="ri-send-plane-fill"></i></button>
                        </div>
                    </div>
                </div>

                {/* Collaborators panel */}
                <div className={`sidePanel w-full h-full flex flex-col bg-white dark:bg-zinc-950 absolute z-20 transition-transform duration-300 ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'} top-0`}>
                    <header className='flex justify-between items-center px-4 h-16 shrink-0 border-b border-slate-200 dark:border-zinc-800'>
                        <h1 className='font-semibold text-lg'>Collaborators</h1>
                        <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className={iconBtn}>
                            <i className="ri-close-line"></i>
                        </button>
                    </header>
                    <div className="users flex flex-col p-2 overflow-auto thin-scroll">
                        {project.users && project.users.map(user => {
                            return (
                                <div key={user._id} className="user flex gap-3 items-center p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900">
                                    <div className='h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-white font-semibold bg-gradient-to-br from-slate-500 to-slate-700'>
                                        {user.email?.[0]?.toUpperCase()}
                                    </div>
                                    <h1 className='font-medium truncate'>{user.email}</h1>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* ============ CODE WORKSPACE (opens beside chat) ============ */}
            {isWorkspaceOpen && (
            <section className="right flex-grow min-w-0 h-full flex flex-col bg-slate-100 dark:bg-zinc-900">

                <div className="flex items-center justify-between h-16 shrink-0 px-4 border-b border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                    <div className='flex items-center gap-3'>
                        <button onClick={() => setIsWorkspaceOpen(false)} className={iconBtn} title='Back to chat'>
                            <i className="ri-chat-3-line"></i>
                        </button>
                        <h2 className='font-semibold'>Workspace</h2>
                    </div>
                    <div className="actions flex gap-2">
                        <button
                            onClick={async () => {
                                    await webContainer.mount(fileTree)


                                    const installProcess = await webContainer.spawn("npm", [ "install" ])



                                    installProcess.output.pipeTo(new WritableStream({
                                        write(chunk) {
                                            console.log(chunk)
                                        }
                                    }))

                                    if (runProcess) {
                                        runProcess.kill()
                                    }

                                    let tempRunProcess = await webContainer.spawn("npm", [ "start" ]);

                                    tempRunProcess.output.pipeTo(new WritableStream({
                                        write(chunk) {
                                            console.log(chunk)
                                        }
                                    }))

                                    setRunProcess(tempRunProcess)

                                    webContainer.on('server-ready', (port, url) => {
                                        console.log(port, url)
                                        setIframeUrl(url)
                                    })

                                }}
                            className='inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 transition-colors'
                        >
                            <i className="ri-play-fill"></i> Run
                        </button>
                    </div>
                </div>

                <div className='flex flex-grow min-h-0'>
                    <div className="explorer h-full w-52 shrink-0 hidden sm:block overflow-auto thin-scroll border-r border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                        <p className='px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500'>Files</p>
                        <div className="file-tree w-full px-2 pb-4">
                            {
                                Object.keys(fileTree).length === 0 && (
                                    <p className='px-2 py-2 text-sm text-slate-400 dark:text-zinc-500'>No files yet. Ask the AI to build something.</p>
                                )
                            }
                            {
                                Object.keys(fileTree).map((file, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setCurrentFile(file)
                                            setOpenFiles([ ...new Set([ ...openFiles, file ]) ])
                                        }}
                                        className={`tree-element cursor-pointer px-3 py-2 flex items-center gap-2 w-full rounded-lg text-left text-sm transition-colors ${currentFile === file ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300' : 'text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-900'}`}>
                                        <i className="ri-file-code-line"></i>
                                        <p className='truncate'>{file}</p>
                                    </button>))
                            }
                        </div>
                    </div>

                    <div className="code-editor flex flex-col flex-grow h-full min-w-0">

                        <div className="top flex w-full overflow-x-auto thin-scroll border-b border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                            <div className="files flex">
                                {
                                    openFiles.map((file, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentFile(file)}
                                            className={`open-file cursor-pointer px-4 py-2.5 flex items-center w-fit gap-2 text-sm border-r border-slate-200 dark:border-zinc-800 transition-colors ${currentFile === file ? 'bg-slate-100 font-medium text-slate-900 dark:bg-zinc-900 dark:text-white' : 'text-slate-500 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-900/60'}`}>
                                            <p>{file}</p>
                                        </button>
                                    ))
                                }
                            </div>
                        </div>

                        <div className="bottom flex flex-grow max-w-full min-h-0 overflow-auto thin-scroll">
                            {
                                fileTree[ currentFile ] ? (
                                    <div className="code-editor-area h-full overflow-auto flex-grow bg-[#2e3440] thin-scroll">
                                        <pre
                                            className="hljs h-full">
                                            <code
                                                className="hljs h-full outline-none"
                                                contentEditable
                                                suppressContentEditableWarning
                                                onBlur={(e) => {
                                                const updatedContent = e.target.innerText;
                                                const ft = {
                                                    ...fileTree,
                                                    [ currentFile ]: {
                                                        file: {
                                                            contents: updatedContent
                                                        }
                                                    }
                                                }
                                                setFileTree(ft)
                                                saveFileTree(ft)
                                            }}
                                                dangerouslySetInnerHTML={{ __html: hljs.highlight('javascript', fileTree[ currentFile ].file.contents).value }}
                                                style={{
                                                    whiteSpace: 'pre-wrap',
                                                    paddingBottom: '25rem',
                                                    counterSet: 'line-numbering',
                                                }}
                                            />
                                        </pre>
                                    </div>
                                ) : (
                                    <div className='flex-grow flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500'>
                                        <i className="ri-code-box-line text-5xl"></i>
                                        <p className='mt-2 text-sm'>Select a file to view or edit it</p>
                                    </div>
                                )
                            }
                        </div>

                    </div>

                    {iframeUrl && webContainer &&
                        (<div className="flex w-1/2 min-w-80 flex-col h-full border-l border-slate-200 dark:border-zinc-800">
                            <div className="address-bar border-b border-slate-200 dark:border-zinc-800">
                                <input type="text"
                                    onChange={(e) => setIframeUrl(e.target.value)}
                                    value={iframeUrl} className="w-full px-4 py-2.5 text-sm bg-white text-slate-700 outline-none dark:bg-zinc-950 dark:text-zinc-300" />
                            </div>
                            <iframe src={iframeUrl} className="w-full h-full bg-white"></iframe>
                        </div>)
                    }
                </div>

            </section>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white p-5 rounded-2xl w-full max-w-md relative shadow-2xl dark:bg-zinc-900 dark:border dark:border-zinc-800">
                        <header className='flex justify-between items-center mb-4'>
                            <h2 className='text-xl font-semibold'>Select User</h2>
                            <button onClick={() => setIsModalOpen(false)} className={iconBtn}>
                                <i className="ri-close-line"></i>
                            </button>
                        </header>
                        <div className="users-list flex flex-col gap-1 mb-20 max-h-96 overflow-auto thin-scroll">
                            {users.map(user => (
                                <div key={user._id} className={`user cursor-pointer p-2.5 flex gap-3 items-center rounded-xl border transition-colors ${Array.from(selectedUserId).indexOf(user._id) != -1 ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-transparent hover:bg-slate-100 dark:hover:bg-zinc-800'}`} onClick={() => handleUserClick(user._id)}>
                                    <div className='h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-white font-semibold bg-gradient-to-br from-slate-500 to-slate-700'>
                                        {user.email?.[0]?.toUpperCase()}
                                    </div>
                                    <h1 className='font-medium truncate'>{user.email}</h1>
                                    {Array.from(selectedUserId).indexOf(user._id) != -1 && <i className="ri-check-line ml-auto text-indigo-600 dark:text-indigo-400 text-lg"></i>}
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={addCollaborators}
                            className='absolute bottom-5 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-xl text-white font-medium bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition'>
                            Add Collaborators
                        </button>
                    </div>
                </div>
            )}
        </main>
    )
}

export default Project
