document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', () => sent_mail());

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#load-mail').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#load-mail').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  fetch('/emails/' + `${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(email => {
      const email_element = document.createElement('div');
      email_element.className = 'email_element';
      email_element.innerHTML = '<span class= "sender">' + `${email['sender']}` + '</span>';
      email_element.innerHTML += '<span> | ' + `${email['subject']}` + '</span>';
      email_element.innerHTML += '<span class= "timestamp">' + `${email['timestamp']}` + '</span>';
      
      email_element.addEventListener('click', e => {
        load_mail(email['id']);
      });

      document.querySelector('#emails-view').append(email_element);
    });
  });  

}


function load_mail(id){
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#load-mail').style.display = 'block';

  document.querySelector('#load-mail').innerHTML = '';
  
  // fetch mail data from API 
  fetch('/emails/'+ id)
  .then(response => response.json())
  .then(email => {
    const mail_details = document.createElement('div');
    mail_details.innerHTML = `<div><span class='sender'>From: </span><span>${email['sender']}</span></div>`;
    mail_details.innerHTML += `<div><span class='sender'>To: </span><span>${email['recipients']}</span></div>`;
    mail_details.innerHTML += `<div><span class='sender'>Subject: </span><span>${email['subject']}</span></div>`;
    mail_details.innerHTML += `<div><span class='sender'>Timestamp: </span><span>${email['timestamp']}</span></div>`;
    mail_details.innerHTML += '<br>';
    mail_details.innerHTML += '<button id= "replay-btn"><a>replay<a></button>';

    if (email['archived'] == false){
      mail_details.innerHTML += '<button id= "archive-btn"><a>archive<a></button>';
    }else{
      mail_details.innerHTML += '<button id= "unarchive-btn"><a>unarchive<a></button>';
    }

    mail_details.innerHTML += '<hr>';
    mail_details.innerHTML += `<div>${email['body']}</div>`

    document.querySelector('#load-mail').append(mail_details);

    fetch('/emails/' + id, {
      method: 'PUT',
      body: JSON.stringify({
        reed: 'true'
      })
    })
    let email_shit = email;
    console.log(email['archived']);
    
    // the following section can became better but ....
    if (email['archived'] == false){
      document.querySelector('#archive-btn').addEventListener('click', () => {
        fetch('/emails/' + email_shit['id'], {
          method: 'PUT',
          body: JSON.stringify({
            archived: true
          })
        })

        load_mailbox('inbox')
      });
    }else{
      document.querySelector('#unarchive-btn').addEventListener('click', () => {
        console.log('clicked');
        fetch('/emails/' + email_shit['id'], {
          method: 'PUT',
          body: JSON.stringify({
            archived: false
          })
        })

        load_mailbox('inbox')
      });
    }

    document.querySelector('#replay-btn').addEventListener('click', () => {
      let body = `On ${email['timestamp']}  ${email['sender']} wrote: ${email['body']} `
      let subject
      if (email['subject'].startsWith === 'Re:')
        subject = email['subject'];
      else{
        subject = `Re: ${email['subject']}` 
      }


      replay_email(email['sender'], subject, body)
    });


  });

}

function sent_mail() {
  console.log('start')
  recipients = document.querySelector('#compose-recipients');
  subject = document.querySelector('#compose-subject');
  body = document.querySelector('#compose-body');

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients.value,
      subject: subject.value,
      body: body.value
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log('result')
  });

  return false;
}

function replay_email(recipient, subject, body) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#load-mail').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = recipient;
  document.querySelector('#compose-subject').value = subject;
  document.querySelector('#compose-body').value = body;
}