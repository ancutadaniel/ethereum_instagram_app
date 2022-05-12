// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Instagram {
  string public name = "Instagram";
  address public owner;
  uint public imageCount;

  struct Image {
    uint id;
    string hash;
    string description;
    uint tipAmount;
    address payable author;
  }

  // store images
  mapping(uint => Image) public images;

  constructor()  {
    owner = msg.sender;
  }

  event UploadImage(uint id, string hash, string description, uint tipAmount, address author);
  event TipImage(uint id, uint tipAmount, address sender);

  function uploadImage(string memory _hash, string memory _description) public payable {
      require(bytes(_hash).length > 3, 'should have a hash set');
      require(bytes(_description).length > 3, 'should have a description set');
      require(msg.sender != address(0x0), "should have a valid address");  

      imageCount += 1;
      Image memory newImage = Image(imageCount, _hash, _description, msg.value, payable(msg.sender));  
      images[imageCount] = newImage;
      emit UploadImage(imageCount, _hash, _description, msg.value, msg.sender);
  }

  function tipImage(uint _id) public payable {
    require(_id > 0 && _id <= imageCount, 'should have a correct id');
    // fetch image
    Image memory image = images[_id];
    // fetch the author and transfer money
    image.author.transfer(msg.value);
    // update tip amount
    image.tipAmount +=  msg.value;
    // update image in mapping
    images[_id]= image;  
    // emit event
    emit TipImage(_id, msg.value, msg.sender);
  }
}
