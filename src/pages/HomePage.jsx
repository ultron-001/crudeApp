import BlogListView from "../BlogsList";
import {Link} from "react-router-dom";

export default function HomePage(){
    return(
        <div>
            <Link to={"/signup/"}>Signin</Link>
            <BlogListView />
        </div>
    )
}