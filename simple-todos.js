//simple-todos.js
Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
  //run con client
  Template.body.helpers({
    tasks: function() {
      if (Session.get("hideCompleted")) {
        //if hide completed is checked, filter tasks
        return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1} });
      } else {
        //otherwise retrun everything
        return Tasks.find({}, {sort: {createdAt: -1}});
      }
    },
    hideCompleted: function () {
      return Session.get("hideCompleted");
    },
    
    incompleteCount: function() {
      return Tasks.find({checked: {$ne: true}}).count();
    }
  });
  
  Template.body.events({
    "submit .new-task": function (event) {
      var text = event.target.text.value;
      
      Meteor.call("addTask", text);
      
      // Clear form
      event.target.text.value = "";
      
      //prevent default form submit
      return false;
    },
    
    "change .hide-completed input": function(event) {
    Session.set("hideCompleted", event.target.checked)
  }
  });
  
  Template.task.events({
    "click .toggle-checked": function () {
      //set the checked property to the opposite of current state
      Meteor.call("setChecked", this._id, ! this.checked);
    },
    "click .delete": function () {
      Meteor.call("deleteTask", this._id);
    }
  });
  
  //acounts stuff
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
  
  //subscribe to tasks data
  Meteor.subscribe("tasks");
}

Meteor.methods({
  addTask: function (text) {
    //make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    
    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function (taskId) {
    Tasks.remove(taskId);
  },
  setChecked: function (taskId, setChecked) {
    Tasks.update(taskId, { $set: { checked: setChecked } });
  }
});

if (Meteor.isServer) {
  Meteor.publish("tasks", function() {
    return Tasks.find();
  });
}