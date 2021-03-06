const mongoCollections = require("./collections");
const threadCollection = mongoCollections.threads;
const users = require("./users");
const posts = require("./posts");
const uuid = require("node-uuid");
const mongo = require("mongodb");

async function createThread(username, title, forum, content) // a new thread should also create a new post
// maybe no content, and just have the content be part of the post that is subsequently created
{
    if (!username || typeof username != "string")
    {
        throw "You must provide a user for your thread in the form of a string.";
    }
    if (!title || typeof title != "string")
    {
        throw "You must provide a title for your thread in the form of a string.";
    }
    if (!forum || typeof forum != "string")
    {
        throw "You must provide a forum for your thread in the form of a string.";
    }
/*
    const threadDB = await threadCollection();

    let newThread = {
        username: username,
        title: title,
        forum: forum
    };

    const insertInfo = await threadCollection.insertOne(newThread);
    if (insertInfo.insertedCount === 0) 
    {
        throw "Could not create thread."
    }

    posts.addPost(username, content);

    const newId = insertInfo.insertedId;
    const thread = await this.getThreadById(newId);

    return thread;
*/

    const id = uuid.v4();
    const newPost = await posts.addPost(username, content, id);

    return threadCollection().then(threadDB => {
        let newThread = {
            _id: id,
            title: title,
            forum: forum,
            username: username,
            posts: [newPost._id]
        };
  
        return threadDB
          .insertOne(newThread)
          .then(newInsertInformation => {
            return newInsertInformation.insertedId;
          })
          .then(newId => {
            return this.getThreadById(newId);
          });
      });
}

async function getThreadById(id)
{
    if (!id) 
    {
        throw "You must provide an id to search for."
    }

    const threadDB = await threadCollection();
    const thread = await threadDB.findOne({ _id: id });
    if (thread === null)
    {
        throw "No post exists with that id."
    }

    return thread;
}

async function getThreadsByUser(username) { // maybe use user ID instead of name? not sure if it matters
    if (!username)
    {
        throw "You must provide a user to search for."
    }
    const threadCollection = await threads();
    const thread = await threadCollection.find({ username: String(username) }).toArray();
    if (thread === null)
    {
        throw "No threads exist by that user."
    }
    return thread;
}

async function getThreadsByForum(forum) {
    if (!forum)
    {
        throw "You must provide a forum to search for."
    }
   
    const threadDB = await threadCollection();
    
    const threadArray = await threadDB.find({ forum: String(forum) }).toArray();

    return threadArray;
}

/*async function getAllPosts() 
{
    const postCollection = await posts();
    const postsAll = await postCollection.find({}).toArray();
    let authorId;
    let authorName;

    for (let x = 0; x < postsAll.length; x++)
    {
        authorId = postsAll[x].author;
        authorName = await animals.get(authorId);
        postsAll[x].author = {_id: authorName._id, name: authorName.name};
    }
    return postsAll;
}*/

async function deleteThreadById(id) { // needs to also delete any posts that are in that thread
    if (!id)
    {
        throw "You must provide an id to search for.";
    }
    const threadCollection = await threads();
    const theThread = await this.getThreadById(id);
    const deletionInfo = await threadCollection.removeOne({ _id: id });
    if (deletionInfo.deletedCount === 0) 
    {
        throw `Could not delete post with id of ${id}`;
    }
    let result = {"deleted": true, "data": theThread};
    return result;
}

/*async function emoveByAuthor(authorId) {
if (!authorId)
{
    throw "You must provide an id or string to search for";
}
const deletePosts = await this.getPostByAuthor(String(authorId));
for (let x = 0; x < deletePosts.length; x++) 
{
    await this.removeById(deletePosts[x]._id);
}
}*/

async function editThread(id, newTitle) {
if (!id)
{
    throw "You must provide an id to search for.";
}

if (!newTitle)
{
    throw "You must provide a new title for the thread.";
}

const threadCollection = await threads();
const postUpdate = {
    $set: { title: newTitle }
};

const updatedInfo = await threadCollection.updateOne({ _id: id }, postUpdate);
if (updatedInfo.modifiedCount === 0) 
{
    throw "The thread title wasn't changed.";
}

return await this.getThreadById(id);
}

/*async function updateContent(id, newContent) {
    if (!id)
    {
    throw "You must provide an id to search for";
    }

    if (!newContent)
    {
    throw "You must provide new content for the post";
    }

    const postCollection = await posts();
    const postUpdate = {
        $set: { content: newContent }
    };
    
    const updatedInfo = await postCollection.updateOne({ _id: mongo.ObjectId(id) }, postUpdate);
    if (updatedInfo.modifiedCount === 0) 
    {
        throw "The post content wasn't changed";
    }

    return await this.getPostById(id);
}*/

module.exports = {
    createThread,
    getThreadById,
    getThreadsByUser,
    getThreadsByForum,
    deleteThreadById,
    editThread
}
