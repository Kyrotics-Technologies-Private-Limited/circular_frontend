
const Loader = () => {
  return (
    <div className="flex justify-center items-center h-64">
      {/* Add the style element with all our animations and pseudo-element styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .custom-loader {
              transform: rotateZ(45deg);
              perspective: 1000px;
              border-radius: 50%;
              width: 48px;
              height: 48px;
              color: #4B0082;
              position: relative;
            }
            
            .custom-loader::before,
            .custom-loader::after {
              content: '';
              display: block;
              position: absolute;
              top: 0;
              left: 0;
              width: inherit;
              height: inherit;
              border-radius: 50%;
              animation: 1s custom-spin linear infinite;
            }
            
            .custom-loader::before {
              transform: rotateX(70deg);
            }
            
            .custom-loader::after {
              color: #FF3D00;
              transform: rotateY(70deg);
              animation-delay: .4s;
            }
            
            @keyframes custom-spin {
              0%, 100% { box-shadow: .2em 0px 0 0px currentcolor; }
              12% { box-shadow: .2em .2em 0 0 currentcolor; }
              25% { box-shadow: 0 .2em 0 0px currentcolor; }
              37% { box-shadow: -.2em .2em 0 0 currentcolor; }
              50% { box-shadow: -.2em 0 0 0 currentcolor; }
              62% { box-shadow: -.2em -.2em 0 0 currentcolor; }
              75% { box-shadow: 0px -.2em 0 0 currentcolor; }
              87% { box-shadow: .2em -.2em 0 0 currentcolor; }
            }
          `
        }}
      />
      
      {/* The actual loader div */}
      <div className="custom-loader" />
    </div>
  );
};

export default Loader;