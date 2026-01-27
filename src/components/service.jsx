import React from 'react';
import './style.css';
import Cards from './cards'

function Service() {
  return (
    <section id="services" className="section_container service_container">
      <div className="service__header">
        <div className="section_header_container">
          <h2 className="section__header">Our Special Service</h2>
          <p>
            Your mental well-being is our top priority.  
            We're here to make it easy for you to connect with compassionate, 
            professional therapists who truly care about your journey.  
          </p>
        </div>
      </div>
      <div class="service__grid">
        <Cards title='Online Therapy Sessions' contenet='Access professional therapy through secure video and audio calls. Our platform connects you 
                    with experienced therapists who are here to support your mental health journey, no matter where you are. ' link='Learn More'/>
        <Cards title='Progress Tracking' contenet='Monitor your journey with our easy-to-use progress tracker,
                    helping you visualize improvements and stay motivated on your mental health path. ' link='Learn More'/>
        <Cards title='24/7 Available' contenet='Reach out anytime, 24/7, for immediate assistance from trained professionals.
                    Whether its a mental health emergency or a difficult moment, 
                    were here to provide support and guidance when you need it most.' link='Learn More'/>
      </div>


    </section>
  );
}

export default Service;