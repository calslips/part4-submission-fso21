const mongoose = require('mongoose');
const supertest = require('supertest');
const { nonExistingId, initialBlogs, initialUsers } = require('./test_helper');
const app = require('../app');

const api = supertest(app);
const Blog = require('../models/blog');
const User = require('../models/user');

let testToken;

beforeAll(async () => {
  await User.deleteMany({});

  for (let user of initialUsers) {
    await api
      .post('/api/users')
      .send(user);
  }

  const loginInfo = await api
    .post('/api/login')
    .send({
      username: initialUsers[0].username,
      password: initialUsers[0].password
    });

  testToken = loginInfo.body.token;

  await Blog.deleteMany({});

  for (let blog of initialBlogs) {
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${testToken}`)
      .send(blog);
  }
});

describe('when blogs are saved', () => {
  test('blogs are fetched in JSON format', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('number of blogs fetched equal number of all blogs', async () => {
    const response = await api.get('/api/blogs');
    expect(response.body).toHaveLength(initialBlogs.length);
  });

  test('unique identifier property named id exists', async () => {
    const response = await api.get('/api/blogs');
    response.body.map((blog) => {
      expect(blog.id).toBeDefined();
    });
  });
});

describe('when new blogs are added', () => {
  test('the blog is added to the list', async () => {
    const newBlog = {
      title: 'A Random Blog',
      author: 'Persimmon Tree',
      url: 'http://www.fakerandomblog.com',
      likes: 3
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${testToken}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const newBlogList = await Blog.find({});
    expect(newBlogList).toHaveLength(initialBlogs.length + 1);

    const titles = newBlogList.map((blog) => blog.title);
    expect(titles).toContain('A Random Blog');
  });

  test('likes property will default to 0 if missing', async () => {
    const noLikesBlog = {
      title: 'The Likely Unliked Blog',
      author: 'Warm Swarm',
      url: 'http://www.likednoteevenonce.com',
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${testToken}`)
      .send(noLikesBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const newBlogList = await Blog.find({});
    expect(newBlogList[newBlogList.length - 1]).toHaveProperty('likes', 0);
  });

  test('backend responds with status code 400 when title & url are missing', async () => {
    const noTitleBlog = {
      author: 'Schwan Fawn',
      url: 'http://blog.donottitleme.com',
      likes: 1
    };

    const noUrlBlog = {
      title: 'Tales of the Lost URL',
      author: 'Absent Mind',
      likes: 7
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${testToken}`)
      .send(noTitleBlog)
      .expect(400);

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${testToken}`)
      .send(noUrlBlog)
      .expect(400);
  });

  test('fails with status code 401 if no token provided', async () => {
    const notAddedBlog = {
      title: 'Never Read',
      author: 'Meant Fornone',
      url: 'http://www.viewerlessblog.com',
      likes: 8
    };

    await api
      .post('/api/blogs')
      .send(notAddedBlog)
      .expect(401);
  });
});

describe('deleting a blog', () => {
  test('with valid id results in status code 204', async () => {
    const startBlogs = await Blog.find({});
    const deleteBlog = startBlogs[0];

    await api
      .delete(`/api/blogs/${deleteBlog.id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .expect(204);

    const newBlogList = await Blog.find({});
    expect(newBlogList).toHaveLength(startBlogs.length - 1);

    const titles = newBlogList.map((blog) => blog.title);
    expect(titles).not.toContain(deleteBlog.title);
  });

  test('with invalid id results in status code 400', async () => {
    const startBlogs = await Blog.find({});
    const invalidId = '214mkfd329msdl21934d3d1';

    await api
      .delete(`/api/blogs/${invalidId}`)
      .set('Authorization', `Bearer ${testToken}`)
      .expect(400);

    const blogListAfter = await Blog.find({});
    expect(blogListAfter).toHaveLength(startBlogs.length);
  });

  test('with no token results in status code 401', async () => {
    const startBlogs = await Blog.find({});
    const deleteBlog = startBlogs[0];

    await api
      .delete(`/api/blogs/${deleteBlog.id}`)
      .expect(401);

    const blogListAfter = await Blog.find({});
    expect(blogListAfter).toHaveLength(startBlogs.length);
  });
});

describe('updating blog likes', () => {
  test('with valid id results in status code 200', async () => {
    const startBlogs = await Blog.find({});
    const oldBlog = startBlogs[0];
    const updateLikes = {
      likes: oldBlog.likes + 1
    };

    await api
      .put(`/api/blogs/${oldBlog.id}`)
      .send(updateLikes)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const blogListAfter = await Blog.find({});
    expect(blogListAfter[0].id).toBe(oldBlog.id);
    expect(blogListAfter[0].likes).toBe(startBlogs[0].likes + 1);
  });

  test('with invalid id results in status code 400', async () => {
    const invalidId = '214mkfd329msdl21934d3d1';

    await api
      .put(`/api/blogs/${invalidId}`)
      .send({ likes: 123 })
      .expect(400);
  });

  test('with nonexisting id results in status code 404', async () => {
    const validUnmatchedId = await nonExistingId();

    await api
      .put(`/api/blogs/${validUnmatchedId}`)
      .send({ likes: 1 })
      .expect(404);
  });
});

describe('creating a new user', () => {
  test('succeeds with a unique username', async () => {
    const startUsers = await User.find({});

    const newUser = {
      username: 'flashbang',
      name: 'Hardy Har',
      password: 'peakaboo'
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const endUsers = await User.find({});
    expect(endUsers).toHaveLength(startUsers.length + 1);

    const usernames = endUsers.map((user) => user.username);
    expect(usernames).toContain(newUser.username);
  });

  test('fails with appropriate status code if username taken', async () => {
    const startUsers = await User.find({});

    const newUser = {
      username: 'kazakhing',
      name: 'Azamat Bagatov',
      password: 'missedinborat2'
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('`username` to be unique');

    const endUsers = await User.find({});
    expect(endUsers).toHaveLength(startUsers.length);

    const names = endUsers.map((user) => user.name);
    expect(names).not.toContain(newUser.name);
  });

  test('fails with appropriate status code if username length < 3', async () => {
    const startUsers = await User.find({});

    const newUser = {
      username: 'no',
      name: 'Always No',
      password: 'noforall'
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain(`\`username\` (\`${newUser.username}\`) is shorter than the minimum allowed length (3)`);

    const endUsers = await User.find({});
    expect(endUsers).toHaveLength(startUsers.length);
  });

  test('fails with appropriate status code if username is missing', async () => {
    const startUsers = await User.find({});

    const newUser = {
      username: '',
      name: 'Nameless',
      password: 'nopwfornoname'
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('`username` is required');

    const endUsers = await User.find({});
    expect(endUsers).toHaveLength(startUsers.length);
  });

  test('fails with appropriate status code if password length < 3', async () => {
    const startUsers = await User.find({});

    const newUser = {
      username: 'twoisenough',
      name: 'Tutu O\'Toole',
      password: '2t'
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    const endUsers = await User.find({});
    expect(endUsers).toHaveLength(startUsers.length);
  });

  test('fails with appropriate status code if password is missing', async () => {
    const startUsers = await User.find({});

    const newUser = {
      username: 'unsecured',
      name: 'Naive Naomi',
      password: ''
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    const endUsers = await User.find({});
    expect(endUsers).toHaveLength(startUsers.length);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
