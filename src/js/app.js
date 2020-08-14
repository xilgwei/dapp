App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    // 现代dapp浏览器...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
          // 请求帐户访问
          await window.ethereum.enable();
      } catch (error) {
          // 用户拒绝了帐户访问权限...
          console.error("User denied account access")
      }
    }
    // 旧版Dapp浏览器...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // 如果未检测到注入的web3实例，请退回Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
        var AdoptionArtifact = data;
        App.contracts.Adoption = TruffleContract(AdoptionArtifact);
        App.contracts.Adoption.setProvider(App.web3Provider);
        return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function(adopters, account) {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;

        return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
        console.log('adopters = ' + adopters)
        console.log('account = ' + account)
        for (i = 0; i < adopters.length; i++) {
            if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
                $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
            }
        }
    }).catch(function(err) {
        console.log(err.message);
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));
    console.log("petId = " + petId)
    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
        if (error) {
            console.log(error);
        }
        console.log(account)
        var account = accounts[0];
        
        App.contracts.Adoption.deployed().then(function(instance) {
            adoptionInstance = instance;
            console.log(adoptionInstance)
            console.log("petId1 = " + petId)
            // Execute adopt as a transaction by sending account
            return adoptionInstance.adopt(petId, {from: account});
        }).then(function(result) {
            console.log(result)
            return App.markAdopted();
        }).catch(function(err) {
            console.log("error = " + err.message);
        });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
