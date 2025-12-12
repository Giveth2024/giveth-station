import axios from "axios";

export function KeepServerAlive()
{
    try
    {
        setInterval(async () => {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_GIVETH_SERVER_API}/`);
            console.log(res);
            const data = await res.data;
            console.log(data)
    
            if (data.status === "Server is running")
            {
                console.log(`Server Status:-> ${data.status}`);
            }
            else
            {
                throw new Error("Server is still alseep!!!");
            }
            
        }, 60000);

    }
    catch(err)
    {
        console.error("Error While Waking the Server Up :-> ", err);
    }
}