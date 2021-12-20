import React from 'react';
const ToastMsg = (props) => {
	const toastMessage = props.toastMessage;
	const heading = props.heading;
	return (
    <>
     	 <p style={{ "textAlign": "center", "fontWeight": "bold","color":"#fff" }}>{heading}</p>
		<ul>
			{toastMessage.map((item, index) =>
			<li key={index}>{item}</li>
			)}
		</ul>
    </>
  );
}
 
export default ToastMsg;