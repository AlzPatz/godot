extends Node2D
class_name class_level

enum POSITION_RELATIVE_TO_CHUNKS { LEFT_OF_CHUNKS, WITHIN_A_CHUNK, RIGHT_OF_CHUNKS } 

var config
var cameras
var builder;
	
var lvlConfig : class_level_config
var lvlData : class_level_data

var initialised : bool = false

var texture : Texture2D

var last_frame_leftmost_chunk_index : int = -1 # first time / standard search starts at the furthest chunk
# which works well for advancing progress. Just caching this chunk index between frames can perhaps help if 
# the player has gone backwards deep into already created chunks or in the case of a distance skip backwards, whilst the first
# search is unavoidable it at least doesn't need to be done each frame. -1 if there wasn't one (either first frame or 
# the frame didn't find a chunk -> but then perhaps it should be saved with created chunk, let's see)

# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.

func init(assets : class_assets, level_builder):
	texture = assets.tex_spritesheet_1
	builder = level_builder

#Do we really need a sep inject and init. Eventually harmonise for all factory set up
func inject(conf, cams):
	config = conf
	cameras = cams
	cameras.world_x_translation.connect(transpose)
	#platforms.resize(config.PLATFORM_ARRAY_MIN_SIZE)
	#platform_array_size = config.PLATFORM_ARRAY_MIN_SIZE
	#AddPlatform(builder.GenerateInitialPlatform())

func configure(level_config : class_level_config):
	lvlConfig = level_config
	#process it?
	lvlData = class_level_data.new()
	lvlData.init(config)
	builder.pass_level_data(lvlData)
	initialised = true #Only truely initialised when configured!

#Called each process but also can be called externally as required
func generate():
	#We draw / have instantiated whole chunks
	#When we add level we increase the furthest RIGHT chunk until it's too large and then create new chunk
	if !initialised: #Must be configured
		pass
	
	var camera_bounds = cameras.ReturnForegroundCameraBounds()
	var camera_xshift = cameras.cameraXShift

	var cam_local_ibounds_min_x: int = floori(camera_bounds.position.x)
	var cam_local_ibounds_max_x: int = ceili(camera_bounds.position.x + camera_bounds.size.x)

	var cam_world_ibounds_min_x: int = camera_xshift + cam_local_ibounds_min_x 
	var cam_world_ibounds_max_x: int = camera_xshift + cam_local_ibounds_max_x 

	var generated_check_world_min_x = cam_world_ibounds_min_x - config.MIN_DISTANCE_OF_GENERATED_LEVEL_FROM_CAMERA_BOUNDS
	var generated_check_world_max_x = cam_world_ibounds_max_x + config.MIN_DISTANCE_OF_GENERATED_LEVEL_FROM_CAMERA_BOUNDS

	if generated_check_world_min_x < config.MIN_X_OF_PLATFORM_WORLD:
		if generated_check_world_max_x > config.MIN_X_OF_PLATFORM_WORLD:
			generated_check_world_min_x = config.MIN_X_OF_PLATFORM_WORLD
		else:
			#Completely below minimum x for world generation so skip doing anything this frame 
			#Should I still clean up level out of bounds? Maybe revisit and skip to that part another time
			#Not crucial now as I don't think ever hits anyway. Three lines just to describe that! lol
			pass #Ensure this short cuts out of method

	var leftmost_chunk_id: int
	var rightmost_chunk_id: int
	var left_relative_chunk_position: POSITION_RELATIVE_TO_CHUNKS
	var right_relative_chunk_position: POSITION_RELATIVE_TO_CHUNKS
	var leftmost_search_finished: bool = false
	var rightmost_search_finished: bool = false
	var chunk_seach_id: int = last_frame_leftmost_chunk_index

	#CAN TRIM OUT "LEFT OF" LOGIC FROM NEXT TWO PARTS OF CODE

	if lvlData.num_platform_chunks > 0:
		if(chunk_seach_id == -1):
			chunk_seach_id = lvlData.num_platform_chunks - 1 #Search from rightmost chunk (more often that not you are searching from the end of the generated level)
		
		#Leftmost search
		while(!leftmost_search_finished):
			if((generated_check_world_min_x < lvlData.platform_data_chunk_array[chunk_seach_id].y) && \
			(generated_check_world_min_x >= lvlData.platform_data_chunk_array[chunk_seach_id].x)):
				#Leftmost is found between data chunk being tested, move to the rightmost
				leftmost_chunk_id = chunk_seach_id
				left_relative_chunk_position = POSITION_RELATIVE_TO_CHUNKS.WITHIN_A_CHUNK
				leftmost_search_finished = true	
			elif (generated_check_world_min_x < lvlData.platform_data_chunk_array[chunk_seach_id].x):
				#Leftmost is below the chunk range, so look at the previous chunks, if there are any
				if chunk_seach_id == 0:
					#No other chunks! left is below chunk 0 SHOULD NOT HIT : LEFT_OF_CHUNK IS NOT VALID ANYMORE
					leftmost_chunk_id = -1 #Use -1 for out of range (enum gives more detail)
					left_relative_chunk_position = POSITION_RELATIVE_TO_CHUNKS.LEFT_OF_CHUNKS 
					leftmost_search_finished = true
				else:
					#Search the next chunk to the left
					chunk_seach_id -= 1	
			elif (generated_check_world_min_x >= lvlData.platform_data_chunk_array[chunk_seach_id].y):
				#Leftmost is above chunk range, so look at the next chunk, if there are any
				if chunk_seach_id == lvlData.num_platform_chunks -1:
					#No other chunks to the right! right is above last chunk
					leftmost_chunk_id = -1 #Use -1 for out of range
					left_relative_chunk_position = POSITION_RELATIVE_TO_CHUNKS.RIGHT_OF_CHUNKS
					leftmost_search_finished = true	
					rightmost_chunk_id = -1 #Use -1 for out of range
					right_relative_chunk_position = POSITION_RELATIVE_TO_CHUNKS.RIGHT_OF_CHUNKS
					rightmost_search_finished = true
				else:
					chunk_seach_id += 1 #I thjink as we start from the last one we never would increment here. Helps if start position chages or I miss something
					# actually think noob up -= i think we store the chunk to start from from the last time around so need to keep lol / this
					# path is valid

		#Rightmost search (as long as not short cutted by leftmost being above furthest chunk)
		while(!rightmost_search_finished):
			if((generated_check_world_max_x < lvlData.platform_data_chunk_array[chunk_seach_id].y) && \
			(generated_check_world_max_x >= lvlData.platform_data_chunk_array[chunk_seach_id].x)):
				#Rightmost is found between data chunk being tested, move to the rightmost
				rightmost_chunk_id = chunk_seach_id
				right_relative_chunk_position = POSITION_RELATIVE_TO_CHUNKS.WITHIN_A_CHUNK
				rightmost_search_finished = true	
			elif (generated_check_world_max_x < lvlData.platform_data_chunk_array[chunk_seach_id].x):
				#Rightmost is below the chunk range, so look at the previous chunks, if there are any
				if chunk_seach_id == 0:
					#No other chunks! right is below chunk 0
					rightmost_chunk_id = -1 #Use -1 for out of range (enum gives more detail)
					right_relative_chunk_position = POSITION_RELATIVE_TO_CHUNKS.LEFT_OF_CHUNKS 
					#By implication, the leftmost search should also be the same...
					assert(left_relative_chunk_position == POSITION_RELATIVE_TO_CHUNKS.LEFT_OF_CHUNKS, "level.gd/generate(): rightmost region found below all chunks, but left wasn't. Not possible :)")
					push_error("level.gd/generate(): Given the first chunk is expected to be created at config.MIN_X_OF_PLATFORM_WORLD, we really shouldn't be below this for the right hand side of the creation scanning range")
					rightmost_search_finished = true
				else:
					#Search the next chunk to the left
					chunk_seach_id -= 1	
			elif (generated_check_world_max_x >= lvlData.platform_data_chunk_array[chunk_seach_id].y):
				#Rightmost is above chunk range, so look at the next chunk, if there are any
				if chunk_seach_id == lvlData.num_platform_chunks -1:
					#No other chunks to the right! right is above last chunk
					rightmost_chunk_id = -1 #Use -1 for out of range
					right_relative_chunk_position = POSITION_RELATIVE_TO_CHUNKS.RIGHT_OF_CHUNKS
					rightmost_search_finished = true	
				else:
					chunk_seach_id += 1	
		
		#Store for next frame (could move later)
		last_frame_leftmost_chunk_index = leftmost_chunk_id 
	else:
		#Equivalent to being to the right of all chunks
		left_relative_chunk_position = POSITION_RELATIVE_TO_CHUNKS.RIGHT_OF_CHUNKS
		right_relative_chunk_position = POSITION_RELATIVE_TO_CHUNKS.RIGHT_OF_CHUNKS	

	var has_existing_chunk_in_range: bool #Only false if first frame? or the camera is moved out of existing chunk data range, then decision made on back filling or not?
	var min_chunk_index: int
	var min_element_index: int #Within first chunk
	var max_chunk_index: int
	var max_element_index: int #Within last chunk (that might be the same as the first! There can also be chunks between min and max)

	var has_empty_range_to_generate: bool
	var empty_range_min_x: int #Must generate new level ATLEAST of this size if not more to adhere to other factors of range generation
	var empty_range_max_x: int 
	#If there is a limit at world start, and all platforms are built from origin, then there can 
	#only be empty range at end , or from origin

	#I don't think we ever hit left of chunks now, unless something wrong
	assert(left_relative_chunk_position != POSITION_RELATIVE_TO_CHUNKS.LEFT_OF_CHUNKS &&
	 	right_relative_chunk_position != POSITION_RELATIVE_TO_CHUNKS.RIGHT_OF_CHUNKS, 
		"Not possible to be left of chunks with prior guards and min x values possible, plus first chunk needing to be made from that minimum.,. something wrong")

	var unexpected_config : bool = false #FAIL MODE. Some will be caught by asserts

	match(left_relative_chunk_position):
		POSITION_RELATIVE_TO_CHUNKS.LEFT_OF_CHUNKS:
			match(right_relative_chunk_position):
				POSITION_RELATIVE_TO_CHUNKS.LEFT_OF_CHUNKS:
					#Not possible. As there will never be a generated LEVEL piece that has empty space to the LEFT
					#NOTE: if there are zero chunks that is caught before and treated as RIGHT-RIGHT
					push_error("level.gd/generate():  Not possible. As there will never be a generated LEVEL piece that has empty space to the LEFT")
				POSITION_RELATIVE_TO_CHUNKS.WITHIN_A_CHUNK:
					#Not possible. As there will never be a generated LEVEL piece that has empty space to the LEFT
					push_error("level.gd/generate():  Not possible. As there will never be a generated LEVEL piece that has empty space to the LEFT")
					unexpected_config = true 
				POSITION_RELATIVE_TO_CHUNKS.RIGHT_OF_CHUNKS:
					#Not Possible. As there will never be a generated LEVEL piece that has empty space to the LEFT 
					push_error("level.gd/generate(): Not Possible. As there will never be a generated LEVEL piece that has empty space to the LEFT")
					unexpected_config = true 
		POSITION_RELATIVE_TO_CHUNKS.WITHIN_A_CHUNK:
			match(right_relative_chunk_position):
				POSITION_RELATIVE_TO_CHUNKS.LEFT_OF_CHUNKS:
					#Not possible. Can't have LEFTMOST in a CHUNK and RIGHTMOST TO THE LEFT OF CHUNKS
					push_error("level.gd/generate(): Can't have LEFTMOST in a CHUNK and RIGHTMOST TO THE LEFT OF CHUNKS")
					unexpected_config = true 
				POSITION_RELATIVE_TO_CHUNKS.WITHIN_A_CHUNK:
					has_existing_chunk_in_range = true
					min_chunk_index = leftmost_chunk_id
					min_element_index = find_min_element_index_in_chunk(min_chunk_index, generated_check_world_min_x)
					max_chunk_index = rightmost_chunk_id
					max_element_index = find_max_element_index_in_chunk(max_chunk_index, generated_check_world_max_x)
					has_empty_range_to_generate = false
					empty_range_min_x = -1
					empty_range_max_x = -1
				POSITION_RELATIVE_TO_CHUNKS.RIGHT_OF_CHUNKS:
					has_existing_chunk_in_range = true 
					min_chunk_index = leftmost_chunk_id
					min_element_index = find_min_element_index_in_chunk(min_chunk_index, generated_check_world_min_x)
					max_chunk_index = lvlData.num_platform_chunks -1
					max_element_index = lvlData.platform_data_chunk_dict[max_chunk_index].index_num_elements_used - 1 #All of them
					has_empty_range_to_generate = true
					empty_range_min_x = lvlData.platform_data_chunk_array[max_chunk_index].y
					empty_range_max_x = generated_check_world_max_x
		POSITION_RELATIVE_TO_CHUNKS.RIGHT_OF_CHUNKS:
			match(right_relative_chunk_position):
				POSITION_RELATIVE_TO_CHUNKS.LEFT_OF_CHUNKS:
					#Not possible. Can't have LEFTMOST RIGHT OF CHUNKS AND RIGHTMOST LEFT OF CHUNKS
					push_error("level.gd/generate(): Not possible. Can't have LEFTMOST RIGHT OF CHUNKS AND RIGHTMOST LEFT OF CHUNKS")
					unexpected_config = true 
				POSITION_RELATIVE_TO_CHUNKS.WITHIN_A_CHUNK:
					#Not possible. Can't have LEFTMOST RIGHT OF CHUNKS AND RIGHTMOST IN MIDDLE OF CHUNK
					push_error("level.gd/generate(): Not possible. Can't have LEFTMOST RIGHT OF CHUNKS AND RIGHTMOST IN NIDDLE OF CHUNK")
					unexpected_config = true 
				POSITION_RELATIVE_TO_CHUNKS.RIGHT_OF_CHUNKS:
					#THIS FIRES ALSO WHEN THERE ARE NO EXISTING CHUNKS
					has_existing_chunk_in_range = false 
					min_chunk_index = -1
					min_element_index = -1
					max_chunk_index = -1
					max_element_index = -1
					has_empty_range_to_generate = true
					empty_range_min_x = generated_check_world_min_x 
					empty_range_max_x = generated_check_world_max_x

	if unexpected_config:
		pass #Fail Message already relayed
	
	var has_additional_left_range_to_generate : bool = false
	var extra_range_min_x : int = 0

	#We always generate up to screen position. IT MAY BE BLANK, but we can't leave spaces with no chunks
	if left_relative_chunk_position == POSITION_RELATIVE_TO_CHUNKS.LEFT_OF_CHUNKS:
		#This MUST be a situation with 0 chunks, and both LEFT AND RIGHT being LEFT_OF
		#It would be filtered out before. In this situation we are simply checking if the 
		#current build range goes back to the origin, if it doesn't there is more to build!
		if empty_range_min_x > config.MIN_X_OF_PLATFORM_WORLD:
			has_additional_left_range_to_generate = true
			extra_range_min_x = config.MIN_X_OF_PLATFORM_WORLD
	elif left_relative_chunk_position == POSITION_RELATIVE_TO_CHUNKS.RIGHT_OF_CHUNKS:
		#This MUST be a situation with both LEFT AND RIGHT being RIGHT_OF
		#It would be filtered out before. In this situation we are simply checking if the 
		#current build range goes back to the rightmost platform side, if it doesn't there is more to build!
		if empty_range_min_x > lvlData.platform_data_chunk_array[lvlData.num_platform_chunks -1].y:
			has_additional_left_range_to_generate = true
			extra_range_min_x = lvlData.platform_data_chunk_array[lvlData.num_platform_chunks -1].y
	
	#Any stored down CHUNKS will have been LOADED when finding min/max elements in chunks

	#Now ensure that existing ELEMENTS within range are INSTANTIATED 
	if has_existing_chunk_in_range:
		var chunk_index : int = min_chunk_index
		while(chunk_index <= max_chunk_index):
			var chunk = lvlData.platform_data_chunk_dict[chunk_index] #We know is NOT stored from finding min/max elements in chunks	
			#Run through all the elements in the chunk, from a min value if first chunk 
			#and a max value if last chunk, or all the elements if a middle chunk
			var min_element_index_this_chunk = 0
			if chunk_index == min_chunk_index:
				min_element_index_this_chunk = min_element_index
			var max_element_index_this_chunk = chunk[lvlData.index_num_elements_used - 1]
			if chunk_index == max_chunk_index:
				max_element_index_this_chunk = max_element_index
			
			for i in range(min_element_index_this_chunk, max_element_index_this_chunk + 1):
				#Check for ELEMENT instantiation
				var transformed_element_index : int = lvlData.index_of_element(i)
				var is_instantiated : bool = chunk[transformed_element_index + lvlData.index_offset_instantiated] == config.TRUE
				if !is_instantiated:
					builder.instantiate() #TO DO

	#Create New Level Where it is Required
		#What to Generate
		#Enough level to satisfy level being present up to MIN_SIZE_OF_NEWLY_GENERATED_LEVEL to the right of the current generated level
		#ACTUALLY camera right -- too check
		#PLUS Level down towards the ORIGIN or the furthest platform
		#Whilst the existance of the region in the chunk data must cover it, it could be tehcnically empty
		#to save processing time on a camera skip for whatever reason
		#or it can back generate a level
	if has_empty_range_to_generate:
		#Two Possible Sections
		#1. From empty_range_min_x TO Right of Screen + REQUIRED GENERATION DISTANCE
		#2. From Origin or the last right + 1 of the Existing Level, to empty_range_min_x
		#Note 2. is captured in has_additional_left_range_to_generate and extra_range_min_x
		var generation_range_min_x : int = empty_range_min_x
		#Should the one below build off the actual right most of current level if a little to right of screen? I DON'T KNOW
		var generation_range_max_x : int = cam_world_ibounds_max_x + config.MIN_SIZE_OF_NEWLY_GENERATED_LEVEL
		var has_blank_level_to_create : bool
		var blank_range_min_x : int
		var blank_range_max_x : int
		if has_additional_left_range_to_generate:
			if config.BACKFILL_LEVEL_OUT_OF_BOUNDS:
				has_blank_level_to_create = false
				generation_range_min_x = extra_range_min_x
			else:
				has_blank_level_to_create = true
				blank_range_min_x = extra_range_min_x
				blank_range_max_x = generation_range_min_x - 1 #Do we do the the minus 1?:)

	


	#HERE: TO DO
	#CREATE A LEVELCREATOR and ASK IT TO CREATE!

	#Store / Uninstantiate any instantiated Chunks that have fallen out of range




	#From here
	#Check if any elements in range within chunks need to be instantiated (from range start to end)
	#Create and instantiate any required new chunks
	#Store any instantiated chunks that are falling out of range (consider set pieces)

	#generated_check_world_min_x

	#Not 100% sure the logic around being left of chunks is even possible given the cut off at -whatever, but then think
	#about no chunks, but that is both "right of"/. ADDED A guard, but this LEFT of CHUNK business probably needs to be stripped out
	#its only use finding left of a chunk is to search the one before, you cant be left of the first...

	#STEPS HERE
		#1. For existing range in chunks identify which portions of elements to check instantiated
		#2. Check and instantiate any elements required
		#3. Check which full range to generate (including any empty space before initially identified empty range)
		#4. Generate empty ranges (and not facility for SET pieces based on certain areas such as the start, or later things like section dividers or bosses?? who knows)

	#NEED TO PROCESS THESE NEXT
	# has_existing_chunk_in_range = true 
	# min_chunk_index = leftmost_chunk_id
	# min_element_index = find_min_element_index_in_chunk(min_chunk_index, generated_check_world_min_x)
	# max_chunk_index = lvlData.num_platform_chunks -1
	# max_element_index = lvlData.platform_data_chunk_dict[max_chunk_index].index_num_elements_used - 1 #All of them
	# has_empty_range_to_generate = true
	# empty_range_min_x = lvlData.platform_data_chunk_array[max_chunk_index].y
	# empty_range_max_x = generated_check_world_max_x

	

	#HERE?! YES :)	

	#WAIT WAIT - run through the above if there are NO CHUNKS YET. Does the logic pan out OK? espp LFT and RIGHT of chunk data.. and then gen
	#IMPORTANT ABOVE!

	#print(str(left_relative_chunk_position) + " : " + str(right_relative_chunk_position))

	#HERE

	# So we need to - generate level that it in range that is uninistialised, regenerate level that is in range but not 
	# instanced, and do nothing in the range where the level is instantiated
	# yep yep tricky bits let's roll

		#is it below 0, is it above max, if nboth out or range are they both belowm both abovem or left below and right above. HOPE YOU CAN REMMEBER TWO!
	#const MIN_DISTANCE_OF_GENERATED_LEVEL_FROM_CAMERA_BOUNDS = GAME_RESOLUTION_WIDTH
	#const MIN_SIZE_OF_NEWLY_GENERATED_LEVEL = GAME_RESOLUTION_WIDTH * 2 

	#First find out if any more level needs to be generated

	#Check if camera is outside of generated area

	#Define area that needs to be generated

	#Check if any of the area is generated

	#Check if any of the area is designed (ie past history but un instantiated (bascially if someone runs backwards))

	#Check if set piece / choriographed

	#Make what you need to and store record of it
	#Level can be perhaps made up of "chunks" of varying size (and perhaps then stored that way)
	#Probably the chunk system makes it easier to queue up or define the choreographed sections

func find_min_element_index_in_chunk(chunk_index: int, min_world_x: int) -> int:
	var chunk = lvlData.platform_data_chunk_dict[chunk_index]
	#If this chunk is NULL then load it from store TO DO
	if chunk == null: #CHECK - need to remove chunk from dict rather than reference null. Do you check for NULL to do that like here or constains key?
			push_error("level.gd/find_min_element_index_in_chunk():  NULL chunk found, shouldn't happen as CHUNK saving not implemented yet")
	assert(lvlData.index_num_elements_used > 0, "level.gd/find_min_element_index_in_chunk(): If it got here CHUNKS are made without atleast one ELEMENT. Probably shoudn't be possible")
	var num_elements_used_in_chunk = chunk[lvlData.index_num_elements_used]
	#We now the position is within a chunk so should overlap one or more ELEMENTS
	if num_elements_used_in_chunk == 1:
		return 0 #There is only one element, it must overlap
	#Find lowest index where RIGHT is above
	#Check if LEFT is below, if not MOVE ON
	#Don't think I can optimise the search in case there are very long low ID ELEMENTS
	#So rather than search we just iterate up from bottom and 
	var index : int = 0
	var found : bool = false
	while(!found && index < num_elements_used_in_chunk):
		var transformed_element_index : int = lvlData.index_of_element(index)
		var left = chunk[transformed_element_index + lvlData.index_offset_left]
		var right = left + chunk[transformed_element_index + lvlData.index_offset_width]
		if left <= min_world_x && right >= min_world_x:
			found = true
	assert(found,  "level.gd/find_min_element_index_in_chunk(): Fell through element search without finding one that straddled lower bound")
	return index

func find_max_element_index_in_chunk(chunk_index: int, max_world_x: int) -> int:
	var chunk = lvlData.platform_data_chunk_dict[chunk_index]
	#If this chunk is NULL then load it from store TO DO
	if chunk == null: #CHECK - need to remove chunk from dict rather than reference null. Do you check for NULL to do that like here or constains key?
			push_error("level.gd/find_max_element_index_in_chunk():  NULL chunk found, shouldn't happen as CHUNK saving not implemented yet")
	assert(lvlData.index_num_elements_used > 0, "level.gd/find_max_element_index_in_chunk(): If it got here CHUNKS are made without atleast one ELEMENT. Probably shoudn't be possible")
	var num_elements_used_in_chunk = chunk[lvlData.index_num_elements_used]
	#We now the position is within a chunk so should overlap one or more ELEMENTS
	if num_elements_used_in_chunk == 1:
		return 0 #There is only one element, it must overlap
	#Find highest index where RIGHT is above & LEFT is below
	#Don't think I can optimise the search in case there are very long ID ELEMENTS
	#So rather than search we just iterate up from bottom and 
	var index : int = num_elements_used_in_chunk -1
	var found : bool = false
	while(!found && index >= 0):
		var transformed_element_index : int = lvlData.index_of_element(index)
		var left = chunk[transformed_element_index + lvlData.index_offset_left]
		var right = left + chunk[transformed_element_index + lvlData.index_offset_width]
		if left <= max_world_x && right >= max_world_x:
			found = true
	assert(found,  "level.gd/find_max_element_index_in_chunk(): Fell through element search without finding one that straddled lower bound")
	return index

#This is connected to the camera's translation signal
func transpose(world_x_shift):
	#EVERYTHIG MUST STORE AN INT X BASE SHIFT]
	print("Shifted")

func _process(_delta):
	if !initialised:
		pass
	generate()




#Keeps a record of the level created
#Manages level "parts"/or areas
#Loads in and out parts of the level
	#GFX and Collision
#Triggers any generation reqired

"""
var populated_level_min_x : int = 0 #This might need to be modified when starting app and initial player track. tbc
var populated_level_max_x : int = 0

var platforms: Array[class_platform] = []
var platform_array_size : int
#





# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	if !initialised:
		pass
	
func AddPlatform(platform : class_platform):
	var index : int = FindEmptyPlatformIndex()
	platforms[index] = platform
	#Check / updates extremities of new platform?
	#To Do

func FindEmptyPlatformIndex() -> int:
	for n in platform_array_size:
		if platforms[n] != null and !platforms[n].active:
			return n
	#Resize array as unable to find an empty slot
	var first_new_slot = platform_array_size
	var new_size = 2 * platform_array_size
	platforms.resize(new_size)
	platform_array_size = new_size
	return first_new_slot
"""
