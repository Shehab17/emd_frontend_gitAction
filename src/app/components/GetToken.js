function  getGetRequestOptions(){
    let jwt = JSON.parse(localStorage.getItem('MyToken'));
    let getRequestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt.token }
      };
   return getRequestOptions ; 
} 
export { getGetRequestOptions };
