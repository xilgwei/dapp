pragma solidity ^0.5.0;

contract Adoption {
    address[16] public adopters;

    address myAddress = this;
    // Adopting a pet
    function adopt(uint petId) public returns (uint) {
        require(petId >= 0 && petId <= 15);
    
        adopters[petId] = msg.sender;

        if (myAddress.balance > 0.01) {

        }
     
        msg.sender.transfer(0.01);

        return petId;
    }

    // Retrieving the adopters
    function getAdopters() public view returns (address[16] memory) {
        return adopters;
    }
}