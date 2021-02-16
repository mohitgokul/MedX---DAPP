pragma solidity >=0.4.22 <0.7.0;

//HospitalRecord Smart contract where you can store information of patients and make transactions

contract HospitalRecord {

    address public hospital;

    struct Patient {
        uint Identification ;
        string Name;
        uint Age;
        string problem;
        bool Reg;
        address Doctor;
    }

    struct Doctor {
        uint Identification ;
        string Name;
        uint Age;
        bool Reg;
        Patient[] patients;
    }

    // There are four phases where you can change your transactions

    enum Phase {Registration, View, Update , Pay}

    mapping(address => Patient) patients;
    mapping(address => Doctor) doctors;
     Patient[] pat_record;
     uint patient_identification;
     uint doctor_identification;

    //default phase is Registration phase where you register your details

    Phase public currentPhase = Phase.Registration;

    //events

    event RegistrationStarted();
    event ViewDetails();
    event UpdatingAge();
    event PayAmount();

    constructor () public payable {
        hospital = msg.sender;
    }

    //modifiers

    modifier validPhase(Phase reqPhase) {
        require(currentPhase == reqPhase);
        _;
    }

    modifier onlyPatient{
        require(patients[msg.sender].Reg, "You aren't Registered yet!");
        _;
    }

    modifier onlyDoctor{
        require(doctors[msg.sender].Reg, "You aren't Registered yet!");
        _;
    }

    modifier onlyHospital{
        require(msg.sender == hospital);
        _;
    }

    // Advance Phase

    function advancePhase() public onlyHospital {
        if (currentPhase == Phase.Pay) {
            currentPhase = Phase.Registration;
        }
        else {
            uint nextPhase = uint(currentPhase) + 1;
            currentPhase = Phase(nextPhase);
        }


        if (currentPhase == Phase.Registration) emit RegistrationStarted();
        if (currentPhase == Phase.View) emit ViewDetails();
        if (currentPhase == Phase.Update) emit UpdatingAge();
        if (currentPhase == Phase.Pay) emit PayAmount();
    }


     // @dev It will create a Patient Register History
     // @param name, age and problem are given by the patients and address P & D to store the address


    function patientRegister(string memory name, uint age, string memory problem, address P, address D) public validPhase (Phase.Registration) onlyHospital {

        patient_identification++;
       patients[P].Identification = patient_identification;
       patients[P].Name = name;
       patients[P].Age = age;
       patients[P].problem = problem;
       patients[P].Reg = true;
       patients[P].Doctor = D;
       doctors[D].patients.push(patients[P]);
    }


     // @dev It will create a Doctor Register History
     // @param name and age are given by the doctors and address D to store the address


    function DoctorRegister(string memory name, uint age, address D) public validPhase (Phase.Registration) onlyHospital {


       doctor_identification++;
       doctors[D].Identification = doctor_identification;
       doctors[D].Name = name;
       doctors[D].Age = age;
       }


     // @dev It will unregister a Patient from the Record
     // @param address P1 to store the address


    function unregisterPatient (address payable P1) onlyHospital public {

        if(hospital!=msg.sender){
            revert();
        }
        patients[P1].Reg = false;

    }

    // @dev It will update the Patient's age details
    // @param age to store the new age

    function updateAge(address A, uint age) public validPhase (Phase.Update) onlyHospital {

        patients[A].Age = age;
        pat_record[patients[A].Identification - 1].Age = age;
    }

    //@dev You can view the Patient Register History
    // keccak256 function will hash the Patients details and will display it in bytes32 value

    function viewRecord() public view validPhase (Phase.View)  returns(bytes32 Id,bytes32 Age,bytes32  Name,bytes32 problem){

         Id = keccak256(abi.encodePacked(patients[msg.sender].Identification));
         Age = keccak256(abi.encodePacked(patients[msg.sender].Age));
         Name = keccak256(abi.encodePacked(patients[msg.sender].Name));
         problem = keccak256(abi.encodePacked(patients[msg.sender].problem));

    }

    // @dev To pay the bill from the Patient to Doctor and hospital
    // @param address toDoctor and toHospital for the amount

     function payBill(address payable toHospital, address payable toDoctor) validPhase (Phase.Pay) onlyPatient payable public {
         uint amount = msg.value;
         toHospital.transfer(amount / 2);
         toDoctor.transfer(amount / 2);
    }

}
