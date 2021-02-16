App = {
  web3Provider: null,
  contracts: {},
  names: new Array(),
  url: 'http://127.0.0.1:7545',
  // network_id: 5777,
  chairPerson: null,
  currentAccount: null,
  registrationPhases: {
    "RegistrationStarted": { 'id': 0, 'text': "Registration Started" },
    "ViewDetails": { 'id': 1, 'text': "View Registration details" },
    "UpdatingAge": { 'id': 2, 'text': "Update Age if needed" },
    "PayAmount": { 'id': 3, 'text': "Pay the Bill" }
  },
  advancePhases: {
    "0": "Registration Started",
    "1": "View Registration details",
    "2": "Update Age if needed",
    "3": "Pay the Bill"
  },

  init: function () {
    return App.initWeb3();
  },

  initWeb3: function() {
        // Is there is an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fallback to the TestRPC
      App.web3Provider = new Web3.providers.HttpProvider(App.url);
    }
    web3 = new Web3(App.web3Provider);
    ethereum.enable();
    // App.populateAddress();
    return App.initContract();
  },

  initContract: function () {
    $.getJSON('HospitalRecord.json', function (data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var voteArtifact = data;
      App.contracts.vote = TruffleContract(voteArtifact);
      App.contracts.mycontract = data;
      // Set the provider for our contract
      App.contracts.vote.setProvider(App.web3Provider);
      App.currentAccount = web3.eth.coinbase;
      jQuery('#current_account').text(App.currentAccount);
      App.getCurrentPhase();
      App.getChairperson();
      return App.bindEvents();
    });
  },

  bindEvents: function () {
    $(document).on("click", "#patient-register", App.handlePatient);
    $(document).on("click", "#doctor-register", App.handleDoctor);
    $(document).on('click', '#change-phase', App.handlePhase);
    $(document).on("click", "#unregister-patient", App.handleUnregister);
    $(document).on("click", "#update-age", App.handleUpdateAge);
    $(document).on("click", "#view-record", App.handleViewRecord);
    $(document).on("click", "#pay-bill", App.handlePayBill);
    // $(document).on('click', '#register', function(){ var ad = $('#enter_address').val(); App.handleRegister(ad); });
  },

  populateAddress : function(){
    new Web3(new Web3.providers.HttpProvider(App.url)).eth.getAccounts((err, accounts) => {
      jQuery.each(accounts,function(i){
        if(web3.eth.coinbase != accounts[i]){
          var optionElement = '<option value="'+accounts[i]+'">'+accounts[i]+'</option';
          jQuery('#enter_address').append(optionElement);
        }
      });
    });
  },

getChairperson: function() {
    App.contracts.vote.deployed().then(function(instance) {
      return instance.hospital();
    }).then(function(result) {
      App.chairPerson = result;
      if(App.currentAccount == App.chairPerson) {
        $(".chairperson").css("display", "inline");
        $(".img-chairperson").css("width", "100%");
        $(".img-chairperson").removeClass("col-lg-offset-2");
      } else {
        $(".other-user").css("display", "inline");
      }
    })
  },

  getCurrentPhase: function() {
    App.contracts.vote.deployed().then(function(instance) {
      return instance.currentPhase();
    }).then(function(result) {
      App.currentPhase = result;
      var notificationText = App.advancePhases[App.currentPhase];
      console.log(App.currentPhase);
      console.log(notificationText);
      $('#phase-notification-text').text(notificationText);
      console.log("Phase set");
    })
  },



  handlePhase: function (event) {
    App.contracts.vote.deployed().then(function (instance) {
      return instance.advancePhase();
    })
    .then(function (result) {
      console.log(result);
      if (result) {
        if (parseInt(result.receipt.status) == 1) {
          if (result.logs.length > 0) {
            App.showNotification(result.logs[0].event);
          }
          else {
            App.showNotification("Ended");
          }
          App.contracts.vote.deployed().then(function(latestInstance) {
            return latestInstance.currentPhase();
          }).then(function(result) {
            console.log("This is also working, new phase updated")
            App.currentPhase = result;
          })
          return;
        }
        else {
          toastr["error"]("Error in changing to next Event");
        }
      }
      else {
        toastr["error"]("Error in changing to next Event");
      }
    })
    .catch(function (err) {
      toastr["error"]("Error in changing to next Event");
    });
  },

  handleDoctor: function () {
    event.preventDefault();
    var name1 = $("#name1").val();
    var age1 = $("#age1").val();
    var doctorAddress1 = $("#doctorAddress1").val();
    web3.eth.getAccounts(function (error, accounts) {
      var account = accounts[0];
      App.contracts.vote.deployed().then(function (instance) {
        bidInstance = instance;

        return bidInstance.DoctorRegister(bidValue, { value: web3.toWei(msgValue, "ether") });
      }).then(function (result, err) {
        if (result) {
          console.log(result.receipt.status);
          if (parseInt(result.receipt.status) == 1)
          toastr.info("Your Registration is Placed!", "", { "iconClass": 'toast-info notification0' });
          else
          toastr["error"]("Error in Registration. Registration Reverted!");
        } else {
          toastr["error"]("Registration Failed!");
        }
      }).catch(function (err) {
        toastr["error"]("Registration Failed!");
      });
    });
  },

  handlePatient: function () {
    event.preventDefault();
    var name = $("#name").val();
    var age = $("#age").val();
    var problem = $("#problem").val();
    var patientAddress = $("#patientAddress").val();
    var doctorAddress =  $("#doctorAddress1").val();
    web3.eth.getAccounts(function (error, accounts) {
      var account = accounts[0];
      App.contracts.vote.deployed().then(function (instance) {
        bidInstance = instance;

        return bidInstance.patientRegister(bidValue, { value: web3.toWei(msgValue, "ether") });
      }).then(function (result, err) {
        if (result) {
          console.log(result.receipt.status);
          if (parseInt(result.receipt.status) == 1)
          toastr.info("Your Registration is Placed!", "", { "iconClass": 'toast-info notification0' });
          else
          toastr["error"]("Error in Registration. Registration Reverted!");
        } else {
          toastr["error"]("Registration Failed!");
        }
      }).catch(function (err) {
        toastr["error"]("Registration Failed!");
      });
    });
  },

  handleUnregister: function (event) {
    var patientAddress2 = $("#unregisterPatient").val();
    App.contracts.vote
    .deployed()
    .then(function (instance) {
      return instance.unregisterPatient(patientAddress);
    })
    .then(function (result) {
      console.log(result);
      if (result && parseInt(result.receipt.status) == 1) {
        App.showNotification("Unregistration Successful", 4);
      } else {
        App.showNotification("Error during unregistration", 5);
      }
    })
    .catch(function (err) {
      console.log(err);
      App.showNotification("Error during unregistration", 5);
    });
  },

  updateAge: function (age2, patientAddress2) {
    $.post(
      "/updateAge",
      {
        age2: age2,
        patientAddress2: patientAddress2,
      },
      function (data, status) {
        if (status == "success") {
          //Reduces the seats value in the table
          if (data.updatedSeats > 0)
          $(".age2" + String(patientAddress)).text(data.updateAge);
          else $("#patient-data" + String(patientAddress)).remove();
        }
      }
    );
  },



  handlePayBill: function (event) {
    var toHospital= $("#hospitalAddress1").val();
    var toDoctor = $("#doctorAddress1").val();
    App.contracts.vote
    .deployed()
    .then(function (instance) {
      return instance.payBill(toHospital, toDoctor);
    })
    .then(function (result) {
      // console.log(result);
      if (result && parseInt(result.receipt.status) == 1) {
        console.log(
          "Amount Paid to Hospital" +
          patientAddress+
          "Amount paid to Doctor " +
          toDoctor
        );
        // App.updateAge(age, patientAddress);
        App.showNotification("Settlement successful", 4);
      } else {
        App.showNotification("Error during settlement", 5);
      }
    })
    .catch(function (err) {
      console.log(err);
      App.showNotification("Error during settlement", 5);
    });
  },


  //Function to show the notification of auction phases
  showNotification: function (phase) {
    var notificationText = App.registrationPhases[phase];
    $('#phase-notification-text').text(notificationText.text);
    toastr.info(notificationText.text, "", { "iconClass": 'toast-info notification' + String(notificationText.id) });
  }
};


$(function () {
  $(window).load(function () {
    App.init();
    //Notification UI config
    toastr.options = {
      "showDuration": "1000",
      "positionClass": "toast-top-left",
      "preventDuplicates": true,
      "closeButton": true
    };
  });
});
