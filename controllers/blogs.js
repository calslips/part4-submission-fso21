const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const { retrieveUser } = require('../utils/middleware');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 });

  response.json(blogs);
});

blogsRouter.post('/', retrieveUser, async (request, response) => {
  const blog = new Blog(request.body);

  blog.user = request.user;

  const savedBlog = await blog.save();
  blog.user.blogs = blog.user.blogs.concat(savedBlog._id);
  await blog.user.save();

  response.status(201).json(savedBlog);
});

blogsRouter.delete('/:id', retrieveUser, async (request, response) => {
  const user = request.user;

  const blog = await Blog.findById(request.params.id);

  if (user && blog.user.toString() === user.id) {
    await Blog.findByIdAndRemove(request.params.id);
    user.blogs = user.blogs
      .filter((blogId) => blogId.toString() !== request.params.id);
    await user.save();
    response.status(204).end();
  } else {
    response.status(401).json({ error: 'invalid user' });
  }
});

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body;
  const blog = {
    likes: body.likes
  };

  const updatedBlog = await Blog
    .findByIdAndUpdate(request.params.id, blog, { new: true, runValidators: true });

  if (updatedBlog) {
    response.json(updatedBlog);
  } else {
    response.status(404).end();
  }
});

module.exports = blogsRouter;
