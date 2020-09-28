const readline = require('readline');


module.exports = class CommandShell{

    constructor(){
        this.rl = readline.createInterface({input: process.stdin,
            output: process.stdout});
        this.main();
    }

    main(){
        console.log("Enter a command or type in 'exit' to shut down the server")
        this.shellPrompt();
        this.initCommands();
        this.rl.on('line',(userInput)=>{
            var command = this.parseInput(userInput);
            var cont = this.parseCommand(command);
            if(cont) this.shellPrompt();
        });

        this.rl.on('close',()=>{
            console.log("goodbye");
            process.exit();
        });
    }

    // creates a new prompt
    shellPrompt(){
        this.rl.setPrompt("> ");
        this.rl.prompt();
    }

    // 
    initCommands(){
        this.commands = 
        {
            "exit":{ commandCount:2, execute:this.exit }
        };
    }
    // parses user input into a command object
    parseInput(userInput){
        var splitInput = userInput.split(" ");
        let command = {
            command:splitInput[0],
            parameters:[],
        }

        // checks if there's extra fields, pushes them to the parameters array
        if(splitInput.length > 1){
            for (var i = 1; i < splitInput.length; i++) {
                command.parameters.push(splitInput[i]); 
            }
        }
        return command;
    }
    //


    // handles the commands
    parseCommand(command){
        
        var commandInterface = this.commands[command.command];
        if(commandInterface==null){ 
            console.log("Command does not exist.")
            return true;
        }
        
        return commandInterface.execute(this.rl);
    }

    exit(rl)
    {
        rl.close();
        return false;
    } 

}

