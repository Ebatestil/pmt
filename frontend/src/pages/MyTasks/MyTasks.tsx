import { useTheme } from "../../context/ThemeContext";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { useState, useEffect, useCallback } from "react";
import "./MyTask.css";
import { fetchTasks, type TaskResponse } from "../../api/Tasks";

interface StoredUser {
    id:number;
}

const STATUS_LABELS: Record<string, string> = {
    todo: "Todo",
    in_progress: "In Progress",
    done: "Done"
}

export default function MyTasks(){
    const { theme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const [myTasks, setMyTasks] = useState<TaskResponse[]>([]);

    const userJson = localStorage.getItem("auth_user");
    const user: StoredUser = userJson ? JSON.parse(userJson) : null;

    const loadTasks = useCallback(async()=>{
        setIsLoading(true);
        setErrorMessage("");
        if(!user) return;
        try{
            const res = await fetchTasks(user.id);
            console.log(res.mytasks);
            setMyTasks(res.mytasks);
        }catch{
            setErrorMessage("Couldn't load your tasks. Please try again.");
        }finally{
            setIsLoading(false);
        }
    }, []);

    useEffect(()=>{
        loadTasks();
    }, [loadTasks]);


    return (
        <div className="mytasks-page" data-theme={theme}>
            <Navbar onMenuClick={()=>setIsSidebarOpen(true)}/>
            <div className="mytasks-body">
                <Sidebar isOpen={isSidebarOpen} onClose={()=>setIsSidebarOpen(false)}/>
                <div className="mytasks-content">
                    <div className="mytasks-header">
                        <div>
                            <h1 className="mytasks-heading">My Tasks</h1>
                            <p className="mytasks-subheading">All Task you're assigned to</p>
                        </div>
                    </div>
                    {isLoading ? (
                        <div className="mytasks-empty">
                            <p className="mytasks-empty_title">
                                Loading Tasks...
                            </p>
                        </div>
                    ): errorMessage ? (
                        <div className="mytasks-empty">
                            <p className="mytasks-empty_title">{errorMessage}</p>
                            <button type="button" className="projects-create-btn" onClick={loadTasks}>
                                Retry
                            </button>
                        </div>
                    ) : (
                        <div className="mytasks-table-wrap">
                            <table className="mytasks-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Status</th>
                                        <th>From</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myTasks.map((mytask) => (
                                        <tr
                                            key={mytask.id}
                                            className="mytasks-tablerow"
                                        >
                                            <td>{mytask.title}</td>
                                            <td>
                                                <span className={`mytasks-status mytasks-status--${mytask.status}`}>
                                                    {STATUS_LABELS[mytask.status]}
                                                </span>
                                            </td>
                                            <td>{mytask.project.name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}