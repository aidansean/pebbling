from project_module import project_object, image_object, link_object, challenge_object

p = project_object('pebbling', 'Pebbling a Chessboard')
p.domain = 'http://www.aidansean.com/'
p.path = 'pebbling'
p.preview_image    = image_object('%s/images/project.jpg'   %p.path, 150, 250)
p.preview_image_bw = image_object('%s/images/project_bw.jpg'%p.path, 150, 250)
p.folder_name = 'aidansean'
p.github_repo_name = 'pebbling'
p.mathjax = True
p.tags = 'Games,Maths'
p.technologies = 'canvas,CSS,HTML,JavaScript'
p.links.append(link_object(p.domain, 'pebbling', 'Live page'))
p.introduction = 'One of the channels I follow on YouTube is called Numberphile, and they give plenty of good ideas for mathematical games.  In this game the user has to move pieces around a chessboard in order to liberate "clones" from a prison. On Numberphile, they suggested playing this game using an actual chessboard, but I decided that a better way to do it would be to write my own game.  So here it is.'
p.overview = '''The user interacts by clicking on the clones it wants to move around.  In addition to this the user can create their own puzzles.  Since I had already developed a lot with the canvas, this was simply a matter of using existing experience to make a game.'''

p.challenges.append(challenge_object('Making the weights.', 'Ideally the weights of the squares should be displayed when requested.  In Firefox this worked fine, but not in Chrome.  The reason for this is that I wanted to make a fraction line with a length proportional to the number of digits in th denominator.  This meant I had to use a <code>log10</code> function, but his does not exist in Chrome.  After much debugging I found the problem and fixed it.  This one bug prevented me from sending this page to Numberphile within a few days of making the game.', 'Resolved'))
