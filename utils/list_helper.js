const dummy = (blogs) => {
  console.log(blogs);
  return 1;
};

const totalLikes = (blogList) => {
  let allLikes = blogList.reduce((likeSum, currentBlog) => {
    let currentLike = currentBlog.likes;
    return likeSum + currentLike;
  }, 0);

  return allLikes;
};

module.exports = {
  dummy,
  totalLikes
};
