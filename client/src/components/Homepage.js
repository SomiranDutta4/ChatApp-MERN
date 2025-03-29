import React, { useContext, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from './Context/ContextProvider';
const Homepage = ({ }) => {
  const { User } = useContext(AppContext)
  const navigate = useNavigate();
  useEffect(() => {
    if (User) {
      navigate('/Login');
    }
  }, [])


  return (
    <>

      {/* <div ref={curr} style={{display:'flex',position:'absolute',width:'20px',height:'20px',backgroundColor:'white'}}></div> */}

      <div class="app-container">
        <h1 class="app-title">
          ChatNgine</h1>

        <div class="link-button-container">
          <Link to="/Login" target="_blank"><button class="link-btn">Try Now</button></Link>
        </div>
      </div>
      <footer class="footer-container">
        <ul class="footer-social-links">
          <li className='ListsFooter'>
            <img className='iconsFooter' src='https://th.bing.com/th/id/OIP.SvWLT28XiMvx136kW9XI9QAAAA?rs=1&pid=ImgDetMain'></img>
            <a href="https://github.com/SomiranDutta4" target="_blank" class="footer-link github-footer">GitHub</a></li>
          <li className='ListsFooter'>
            <img className='iconsFooter' src='https://th.bing.com/th/id/OIP.VArJwZMxFN-qHnD8Xue-QAHaHa?rs=1&pid=ImgDetMain'></img>
            <a href="https://www.linkedin.com/in/somiran-dutta-22534130a?jobid=1234&lipi=urn%3Ali%3Apage%3Ad_jobs_easyapply_pdfgenresume%3Bt%2BmySIBoSL%2Bw7IEqFOeuwg%3D%3D&licu=urn%3Ali%3Acontrol%3Ad_jobs_easyapply_pdfgenresume-v02_profile" target="_blank" class="footer-link linkedin-footer">LinkedIn</a></li>
          <li className='ListsFooter'>
            <img className='iconsFooter' src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" />
            <a href="https://www.instagram.com/somir4n_dutt4/" target="_blank" class="footer-link instagram-footer">Instagram</a></li>
          <li className='ListsFooter'>
            <img className='iconsFooter' src="https://th.bing.com/th/id/OIP.PqXQntbTDb9vH0hx5eTHiAHaHa?rs=1&pid=ImgDetMain" />
            <a href="mailto:d.somiran@iitg.ac.in" class="footer-link email-footer">Email</a></li>
        </ul>
      </footer>
    </>
  )
}

export default Homepage
