const INFERENCE_SERVER = 'http://localhost:5000';

//http://localhost:5000/reserve_spot
//  endpoint /reserve_spot
async function reserve_spot(){
  // send GET request to inference server at /reserve_spot
  const response = await fetch(`${INFERENCE_SERVER}/reserve_spot`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  json = await response.json();
  console.log("response", json)
  // return the response
  return json;
}

//  endpoint /generate_post
async function inference_submission(spot_id, postObj = {}){ 
  console.log("inference_submission", spot_id, postObj)
  // send POST request to inference server at /generate_post 
  const response = await fetch(`${INFERENCE_SERVER}/generate_post`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({
      postObj,
      spot_id
    })
  });
  json = await response.json();
  console.log("inference_submission response", json) 
  // return the response
  return json
  
}

module.exports = {
  inference_submission,
  reserve_spot
}