const listHelper = require('../utils/list_helper');

const emptyList = [];
const singleBlogList = [
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0
  }
];
const multiBlogList = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0
  }
];

test('dummy returns one', () => {
  const blogs = [];

  const result = listHelper.dummy(blogs);
  expect(result).toBe(1);
});

describe('total likes', () => {
  test('of empty list is zero', () => {
    const result = listHelper.totalLikes(emptyList);
    expect(result).toBe(0);
  });

  test('of single blog list equals that blogs like count', () => {
    const result = listHelper.totalLikes(singleBlogList);
    expect(result).toBe(10);
  });

  test('of a large list is accurate', () => {
    const result = listHelper.totalLikes(multiBlogList);
    expect(result).toBe(36);
  });
});

describe('favorite blog', () => {
  test('of empty list is null', () => {
    const result = listHelper.favoriteBlog(emptyList);
    expect(result).toBe(null);
  });

  test('of single blog list equals that blogs data', () => {
    const result = listHelper.favoriteBlog(singleBlogList);
    expect(result).toEqual({
      title: 'First class tests',
      author: 'Robert C. Martin',
      likes: 10
    });
  });

  test('of a large list is the blog with most likes', () => {
    const result = listHelper.favoriteBlog(multiBlogList);
    expect(result).toEqual({
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      likes: 12
    });
  });
});

describe('author with most blogs', () => {
  test('of an empty blog list is null', () => {
    const result = listHelper.mostBlogs(emptyList);
    expect(result).toBe(null);
  });

  test('of a single blog list is that blogs author with a count of 1', () => {
    const result = listHelper.mostBlogs(singleBlogList);
    expect(result).toEqual({
      author: 'Robert C. Martin',
      blogs: 1
    });
  });

  test('of a large list is the author with the highest number of blogs', () => {
    const result = listHelper.mostBlogs(multiBlogList);
    expect(result).toEqual({
      author: 'Robert C. Martin',
      blogs: 3
    });
  });
});

describe('author with most total likes', () => {
  test('of an empty blog list is null', () => {
    const result = listHelper.mostLikes(emptyList);
    expect(result).toBe(null);
  });

  test('of a single blog list is that blogs author and like count', () => {
    const result = listHelper.mostLikes(singleBlogList);
    expect(result).toEqual({
      author: 'Robert C. Martin',
      likes: 10
    });
  });

  test('of a large list is the author with the highest combined likes', () => {
    const result = listHelper.mostLikes(multiBlogList);
    expect(result).toEqual({
      author: 'Edsger W. Dijkstra',
      likes: 17
    });
  });
});
