import Header from './Header';
import NavBar from './NavBar';

export default function MainLayout(){

    return (
        <div className="flex flex-col h-screen">
            <Header/>
            <div className="flex-1">
                Lorem ipsum 
            </div>
            <NavBar/>
        </div>
    );
}
