import React, { useState } from 'react';
import MyGroup from '../MyGroup';
import './AdminPage.css';
import MyLog from '../MyLog';
import { fetchProjects } from '../hedera/contractQueries';
import { contractId } from '../../contracts/contractId';
import MyButton from '../MyButton';
import { paySalary } from '../hedera/makePayments';
import { ProjectStatus } from '../../utils';

const AdminPage = ({walletData, accountId, setPage}) => {
  const [logText, setLogText] = useState("Welcome admin...");
  const [projects, setProjects] = useState([]);

  const today = () => {
    const todayDate = new Date();
    const dd = todayDate.getDate();
    const mm = todayDate.getMonth() + 1;
    const yyyy = todayDate.getFullYear();
    return Number(new Date(`${dd}-${mm}-${yyyy}`).getTime()) / 1000;
  };

  const fetchData = async () => {
    if(!contractId) {
      setLogText("No contracts deployed ...");
      return;
    }
    setProjects((await fetchProjects(walletData, accountId, contractId, true).catch((e) => {
      setLogText("Error fetching projects ...");
      return [];
    })));
  };

  const makePayment = async (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    const success = await paySalary(walletData, accountId, project.staffAccountId, project.salary).catch((e) => {
      console.error(e);
      return false;
    });
    if(success) {
      setLogText(`Payment made to project ${projectId}...`);
      setProjects((prevProjects) => prevProjects.map((p) => {
        if(p.id === projectId) {
          return {...p, status: ProjectStatus.COMPLETED};
        }
        return p;
      }));
    }
    else {
      setLogText(`Error making payment to project ${projectId}...`);
    }
  }


  return (
    <div className='admin'>
      <nav className='navbar'>
        <h1>Admin Page</h1>
        <MyGroup 
          fcn={fetchData}
          buttonLabel={"Fetch Data"}  
        />
        <MyGroup 
          fcn={() => setPage("home")}
          buttonLabel={`🏠︎ Home`}  
        />
      </nav>
      <MyLog message={logText} />
      <div className='body'>
        <div className='section'>
          <h2>Projects</h2>
          <ul>
            {projects.map((project) => (
              <li key={project.id} className='list-element'>
                <span>{project.title + ":  "}</span>
                <span>{project.description}</span>
                {project.endDate <= today() && project.status === ProjectStatus.APPROVED && <MyButton fcn={() => makePayment(project.id)} buttonLabel='Pay'/>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;