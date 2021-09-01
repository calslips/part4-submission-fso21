const dummy = (blogs) => {
  blogs;
  return 1;
};

const totalLikes = (blogList) => {
  let allLikes = blogList.reduce((likeSum, currentBlog) => {
    let currentLike = currentBlog.likes;
    return likeSum + currentLike;
  }, 0);

  return allLikes;
};

const favoriteBlog = (blogList) => {
  if (blogList.length === 0) {
    return null;
  }

  let fav = blogList.reduce((previousBlog, currentBlog) => {
    if (currentBlog.likes > previousBlog.likes) {
      return currentBlog;
    }
    return previousBlog;
  });

  let { title, author, likes } = fav;
  return { title, author, likes };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
};
